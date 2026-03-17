import { db } from "@/lib/db";
import { resources, userContextVectors } from "@/lib/db/schema";
import { pinecone, indexName } from "@/lib/pinecone";
import { inngest } from "./client";
import { google } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, embed } from "ai";
import { eq } from "drizzle-orm";

const contextVectorId = (key: string) => `context:${key}`;

function buildContextProse(key: string, value: string) {
    const k = key.toLowerCase();
    if (k === "employment_status") return `My employment status is currently ${value}.`;
    if (k === "learning_focus") return `I am focusing on learning ${value} right now.`;
    if (k === "current_project") return `I am currently working on ${value}.`;
    if (k === "goal") return `My current goal is ${value}.`;
    if (k === "preference") return `A personal preference of mine is ${value}.`;
    if (k === "note") return `Note about me: ${value}.`;
    return `Personal context about ${key}: ${value}.`;
}

// Using createOpenAI to connect to NVIDIA NIM as it is OpenAI compatible
const nim = createOpenAICompatible({
    name: "nim",
    baseURL: "https://integrate.api.nvidia.com/v1",
    headers: {
        Authorization: `Bearer ${process.env.NIM_API_KEY}`,
    },
});

/**
 * THE ARCHIVIST
 * A multi-step workflow that scrapes, analyzes, embeds, fetches image, and indexes content.
 */
export const processResource = inngest.createFunction(
    { id: "process-resource", concurrency: 5 },
    { event: "resource/add" },
    async ({ event, step }) => {
        const { url } = event.data;

        // 1. Scrape Content via Jina Reader
        const scrapedData = await step.run("scrape-content", async () => {
            const response = await fetch(`https://r.jina.ai/${url}`, {
                headers: {
                    Authorization: `Bearer ${process.env.JINA_API_KEY}`,
                    "X-With-Images-Summary": "true",
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to scrape: ${response.statusText}`);
            }

            return await response.text();
        });

        // 2. Cognitive Analysis via NVIDIA NIM
        const analysis = await step.run("analyze-content", async () => {
            const context = scrapedData.slice(0, 15000); // Limit for token budget

            const { text: rawJson } = await generateText({
                model: nim.chatModel("deepseek-ai/deepseek-v3.2"),
                system: `You are analyzing a saved link for a personal link manager.
The user saves links for future reference - could be learning material, tools, inspiration, or content to consume later.

Output strictly valid JSON with these fields:
- title: Clean, concise title
- summary: 1-2 sentence TL;DR
- keywords: Array of strings - mix of broad terms (AI, ML, DL, React, quant, trading) and specific (Diffusion Models, JEPA, mcp-protocol, ai-sdk, GSAP)
- category: One of "learning", "reference", "tool", "inspiration", "content"
- sourceType: One of "youtube_video", "youtube_channel", "youtube_playlist", "tweet", "article", "github", "paper", "website"
- whySaved: Brief 1-sentence guess why this might be useful
- priority: "high", "medium", or "low" based on perceived value
- unsplashQuery: 2-3 word search query for a relevant image`,
                prompt: `Analyze and extract metadata from this content:\n\nURL: ${url}\n\nContent:\n${context}`,
            });

            // Cleanup markdown code blocks
            const cleanJson = rawJson.replace(/```json|```/g, "").trim();
            let parsed;
            try {
                parsed = JSON.parse(cleanJson);
            } catch (e) {
                // Try to find JSON object if mixed with text
                const match = cleanJson.match(/\{[\s\S]*\}/);
                if (match) {
                    parsed = JSON.parse(match[0]);
                } else {
                    console.error("Failed to parse JSON:", cleanJson);
                    return {
                        title: "Untitled Resource",
                        summary: "Analysis failed",
                        keywords: [],
                        category: "reference",
                        sourceType: "website",
                        whySaved: "",
                        priority: "medium",
                        unsplashQuery: ""
                    };
                }
            }

            return {
                title: parsed.title || "Untitled",
                summary: parsed.summary || "",
                keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
                category: parsed.category || "reference",
                sourceType: parsed.sourceType || "website",
                whySaved: parsed.whySaved || "",
                priority: parsed.priority || "medium",
                unsplashQuery: parsed.unsplashQuery || "",
            };
        });

        // 3. Fetch Unsplash Image
        const imageUrl = await step.run("fetch-unsplash-image", async () => {
            try {
                const query = encodeURIComponent(analysis.unsplashQuery || analysis.title);
                const response = await fetch(
                    `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape`,
                    {
                        headers: {
                            Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
                        },
                    }
                );

                if (!response.ok) {
                    console.error("Unsplash API error:", response.status);
                    return null;
                }

                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    return data.results[0].urls.regular as string;
                }
                return null;
            } catch (e) {
                console.error("Failed to fetch Unsplash image:", e);
                return null;
            }
        });

        // 4. Generate Vector Embedding via Google Gemini
        const vector = await step.run("generate-embedding", async () => {
            const { embedding } = await embed({
                model: google.embeddingModel("text-embedding-004"),
                value: `Title: ${analysis.title}\nSummary: ${analysis.summary}\nKeywords: ${analysis.keywords.join(", ")}\nContent: ${scrapedData.slice(0, 1000)}`,
            });
            return embedding;
        });

        // 5. Transactional Write (Postgres + Pinecone)
        await step.run("save-data", async () => {
            // A. Write to Drizzle (Postgres)
            const [record] = await db
                .insert(resources)
                .values({
                    url,
                    title: analysis.title,
                    content: scrapedData,
                    summary: analysis.summary,
                    keywords: analysis.keywords,
                    category: analysis.category,
                    sourceType: analysis.sourceType,
                    whySaved: analysis.whySaved,
                    priority: analysis.priority,
                    imageUrl: imageUrl,
                    status: "processed",
                    embedding: vector,
                })
                .onConflictDoUpdate({
                    target: resources.url,
                    set: {
                        updatedAt: new Date(),
                        status: "processed",
                        title: analysis.title,
                        summary: analysis.summary,
                        keywords: analysis.keywords,
                        category: analysis.category,
                        whySaved: analysis.whySaved,
                        imageUrl: imageUrl,
                    },
                })
                .returning({ id: resources.id });

            // B. Write to Pinecone
            try {
                await pinecone.index(indexName).upsert([
                    {
                        id: record.id,
                        values: vector,
                        metadata: {
                            type: "resource",
                            url,
                            title: analysis.title,
                            category: analysis.category,
                            sourceType: analysis.sourceType,
                            keywords: analysis.keywords.join(","),
                        },
                    },
                ]);
            } catch (e) {
                console.error("Failed to upsert to Pinecone:", e);
            }
        });

        return { success: true, url };
    }
);

// Keep Pinecone context vectors in sync with the relational source of truth
export const syncContextVector = inngest.createFunction(
    { id: "context-sync", concurrency: 3 },
    { event: "context/updated" },
    async ({ event, step }) => {
        const { key, value } = event.data as { key?: string; value?: string };
        if (!key || !value) {
            return { success: false, error: "Missing key or value" };
        }

        const prose = buildContextProse(key, value);

        // 1) Embed
        const vector = await step.run("embed-context", async () => {
            const { embedding } = await embed({
                model: google.embeddingModel("text-embedding-004"),
                value: prose,
            });
            return embedding;
        });

        // 2) Write to Pinecone and Postgres cache
        await step.run("upsert-context-vector", async () => {
            try {
                await pinecone.index(indexName).deleteOne(contextVectorId(key));
            } catch (e) {
                // ignore delete failures
            }

            try {
                await pinecone.index(indexName).upsert([
                    {
                        id: contextVectorId(key),
                        values: vector,
                        metadata: {
                            type: "context",
                            key,
                            value,
                            prose,
                            updatedAt: new Date().toISOString(),
                        },
                    },
                ]);
            } catch (e) {
                console.error("Failed to upsert context vector to Pinecone:", e);
            }

            try {
                await db
                    .insert(userContextVectors)
                    .values({ key, embedding: vector, lastSyncedAt: new Date() })
                    .onConflictDoUpdate({
                        target: userContextVectors.key,
                        set: { embedding: vector, lastSyncedAt: new Date() },
                    });
            } catch (e) {
                console.error("Failed to persist context embedding cache:", e);
            }
        });

        return { success: true, key };
    }
);

export const deleteContextVector = inngest.createFunction(
    { id: "context-delete", concurrency: 3 },
    { event: "context/deleted" },
    async ({ event }) => {
        const { key } = event.data as { key?: string };
        if (!key) {
            return { success: false, error: "Missing key" };
        }

        try {
            await pinecone.index(indexName).deleteOne(contextVectorId(key));
        } catch (e) {
            console.error("Failed to delete context vector from Pinecone:", e);
        }

        try {
            await db.delete(userContextVectors).where(eq(userContextVectors.key, key));
        } catch (e) {
            console.error("Failed to delete context vector cache:", e);
        }

        return { success: true, key };
    }
);

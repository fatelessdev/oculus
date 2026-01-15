import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { google } from "@ai-sdk/google";
import { streamText, tool, embed, stepCountIs, convertToModelMessages } from "ai";
import { z } from "zod";
import { pinecone, indexName } from "@/lib/pinecone";
import { db } from "@/lib/db";
import { userContext } from "@/lib/db/schema";
import { inngest } from "@/lib/inngest/client";
import { eq } from "drizzle-orm";

export const maxDuration = 60;

const searchParams = z.object({
    query: z.string().min(1).describe("The search query to find relevant resources and personal context"),
    topKResources: z.number().min(1).max(20).optional().describe("Number of resource results to return"),
    topKContext: z.number().min(1).max(20).optional().describe("Number of context results to return"),
});

const contextParams = z.object({
    key: z.string().min(1).describe("Context key like 'employment_status', 'learning_focus', 'current_project', 'goal'"),
    value: z.string().min(1).describe("The context value to save"),
    previousKey: z.string().min(1).optional().describe("Optional previous key when renaming context"),
});

const clearParams = z.object({
    key: z.string().min(1).describe("The context key to clear"),
});

type SearchParams = z.infer<typeof searchParams>;
type ContextParams = z.infer<typeof contextParams>;
type ClearParams = z.infer<typeof clearParams>;

async function emitContextEvent(name: "context/updated" | "context/deleted", data: Record<string, string>) {
    try {
        await inngest.send({ name, data });
    } catch (error) {
        console.error(`Failed to emit ${name}:`, error);
    }
}

export async function POST(req: Request) {
    const { messages } = await req.json();

    // Initialize NIM provider at runtime
    const nim = createOpenAICompatible({
        name: "nim",
        baseURL: "https://integrate.api.nvidia.com/v1",
        headers: {
            Authorization: `Bearer ${process.env.NIM_API_KEY}`,
        },
    });

    // Fetch all personal context upfront
    let personalContext = "";
    try {
        const contextEntries = await db.select().from(userContext);
        if (contextEntries.length > 0) {
            personalContext = contextEntries
                .map((c) => `${c.key}: ${c.value}`)
                .join("\n");
        }
    } catch (e) {
        console.error("Failed to fetch context:", e);
    }

    const systemPrompt = `You are Oculus, a personal AI assistant for a link manager.
Users save links (articles, videos, tweets, GitHub repos, papers) for future reference.

${personalContext ? `USER'S PERSONAL CONTEXT:\n${personalContext}\n\n` : ""}

YOUR CAPABILITIES:
1. Search the user's saved links library using semantic search
2. Save personal context when the user shares info about themselves (goals, job status, learning focus, projects)
3. Update existing context when circumstances change (e.g., "I got a job" updates employment_status)

IMPORTANT:
- When the user shares personal info, use saveContext to store it with an appropriate key
- When recommending resources, consider the user's current context
- When searching, synthesize results and cite sources
- If no resources found, suggest adding relevant links

CONTEXT KEYS TO USE:
- employment_status: current job situation
- learning_focus: what they're trying to learn
- current_project: what they're building
- goal: long-term goals
- preference: likes/dislikes
- note: general notes`;

    const tools = {
        searchLibrary: tool({
            description:
                "Search both saved resources and personal context in one call using semantic vector search.",
            parameters: searchParams,
            execute: async (params: SearchParams) => {
                const query = params.query?.trim();
                if (!query) {
                    return { found: false, message: "Empty search query provided." };
                }

                const topKResources = params.topKResources ?? 5;
                const topKContext = params.topKContext ?? 3;

                try {
                    const { embedding } = await embed({
                        model: google.embeddingModel("text-embedding-004"),
                        value: query,
                    });

                    const index = pinecone.index(indexName);
                    const [resourceResults, contextResults] = await Promise.all([
                        index.query({
                            vector: embedding,
                            topK: topKResources,
                            includeMetadata: true,
                        }),
                        index
                            .query({
                                vector: embedding,
                                topK: topKContext,
                                includeMetadata: true,
                                filter: { type: "context" },
                            })
                            .catch((e) => {
                                console.error("Context query failed:", e);
                                return null;
                            }),
                    ]);

                    const resources = (resourceResults?.matches ?? [])
                        .filter((match) => match.metadata?.type !== "context")
                        .map((match) => ({
                            score: match.score,
                            title: match.metadata?.title,
                            url: match.metadata?.url,
                            category: match.metadata?.category,
                            sourceType: match.metadata?.sourceType,
                            keywords: match.metadata?.keywords,
                        }));

                    const context = (contextResults?.matches ?? [])
                        .map((match) => ({
                            score: match.score,
                            key: match.metadata?.key,
                            value: match.metadata?.value,
                            type: match.metadata?.type,
                            updatedAt: match.metadata?.updatedAt,
                        }))
                        .filter((c) => c.key && c.value);

                    // Fallback to relational truth if no context vectors were found
                    if (context.length === 0) {
                        try {
                            const rows = await db.select().from(userContext);
                            context.push(
                                ...rows.map((row) => ({
                                    score: 0,
                                    key: row.key,
                                    value: row.value,
                                    type: "context-db",
                                    updatedAt: row.updatedAt?.toISOString?.() ?? undefined,
                                }))
                            );
                        } catch (e) {
                            console.error("Context DB fallback failed:", e);
                        }
                    }

                    const found = resources.length > 0 || context.length > 0;

                    return {
                        found,
                        resources,
                        context,
                        message: found ? undefined : "No matching resources or context found.",
                    };
                } catch (error) {
                    console.error("Vector search failed:", error);
                    return { found: false, error: "Search failed. Please try again." };
                }
            },
        }),

        saveContext: tool({
            description:
                "Save or update personal context about the user. Use this when the user shares info about themselves, their goals, job status, learning focus, or projects.",
            parameters: contextParams,
            execute: async (params: ContextParams) => {
                const key = params?.key?.trim();
                const value = params?.value?.trim();
                const previousKey = params?.previousKey?.trim();

                if (!key || !value) {
                    return { success: false, error: "Missing context key or value." };
                }

                try {
                    if (previousKey && previousKey !== key) {
                        await db.delete(userContext).where(eq(userContext.key, previousKey));
                        await emitContextEvent("context/deleted", { key: previousKey });
                    }

                    await db
                        .insert(userContext)
                        .values({
                            key,
                            value,
                        })
                        .onConflictDoUpdate({
                            target: userContext.key,
                            set: {
                                value,
                                updatedAt: new Date(),
                            },
                        });

                    await emitContextEvent("context/updated", { key, value });

                    return { success: true, message: `Saved context: ${key}` };
                } catch (error) {
                    console.error("Failed to save context:", error);
                    return { success: false, error: "Failed to save context." };
                }
            },
        }),

        clearContext: tool({
            description: "Clear a personal context entry by key (also removes it from the vector cache).",
            parameters: clearParams,
            execute: async (params: ClearParams) => {
                const key = params?.key?.trim();
                if (!key) {
                    return { success: false, error: "Missing context key." };
                }

                try {
                    const result = await db
                        .delete(userContext)
                        .where(eq(userContext.key, key))
                        .returning({ key: userContext.key });

                    if (result.length === 0) {
                        return { success: false, error: "Context key not found." };
                    }

                    await emitContextEvent("context/deleted", { key });
                    return { success: true, message: `Cleared context: ${key}` };
                } catch (error) {
                    console.error("Failed to clear context:", error);
                    return { success: false, error: "Failed to clear context." };
                }
            },
        }),

        getContext: tool({
            description: "Get a specific piece of personal context by key.",
            parameters: z.object({
                key: z.string().min(1).describe("The context key to retrieve"),
            }),
            execute: async ({ key }) => {
                const trimmedKey = key?.trim();
                if (!trimmedKey) {
                    return { found: false, error: "Missing context key." };
                }

                try {
                    const result = await db
                        .select()
                        .from(userContext)
                        .where(eq(userContext.key, trimmedKey));

                    if (result.length === 0) {
                        return { found: false };
                    }

                    return { found: true, value: result[0].value };
                } catch (error) {
                    console.error("Failed to get context:", error);
                    return { found: false, error: "Failed to retrieve context." };
                }
            },
        }),
    };

    const modelMessages = await convertToModelMessages(messages, {
        tools
    });

    const result = await streamText({
        model: nim.chatModel("deepseek-ai/deepseek-v3.2"),
        messages: modelMessages,
        system: systemPrompt,
        tools,
        stopWhen: stepCountIs(20),
    });

    return result.toUIMessageStreamResponse();
}

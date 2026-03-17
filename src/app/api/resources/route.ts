import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resources } from "@/lib/db/schema";
import { inngest } from "@/lib/inngest/client";
import { desc } from "drizzle-orm";

export async function GET() {
    try {
        const allResources = await db
            .select({
                id: resources.id,
                url: resources.url,
                title: resources.title,
                sourceType: resources.sourceType,
                category: resources.category,
                summary: resources.summary,
                keywords: resources.keywords,
                whySaved: resources.whySaved,
                priority: resources.priority,
                imageUrl: resources.imageUrl,
                isCurated: resources.isCurated,
                createdAt: resources.createdAt,
                updatedAt: resources.updatedAt,
                status: resources.status,
            })
            .from(resources)
            .orderBy(desc(resources.createdAt));

        return NextResponse.json(allResources);
    } catch (error) {
        console.error("Failed to fetch resources:", error);
        return NextResponse.json(
            { error: "Failed to fetch resources" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Create initial record with pending status
        await db
            .insert(resources)
            .values({
                url,
                title: "Processing...",
                status: "pending",
            })
            .onConflictDoUpdate({
                target: resources.url,
                set: {
                    status: "pending",
                    updatedAt: new Date(),
                },
            });

        // Trigger Inngest background job
        await inngest.send({
            name: "resource/add",
            data: { url },
        });

        return NextResponse.json({ success: true, url });
    } catch (error) {
        console.error("Failed to add resource:", error);
        return NextResponse.json(
            { error: "Failed to add resource" },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { pinecone, indexName } from "@/lib/pinecone";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Delete from PostgreSQL
        const deleted = await db
            .delete(resources)
            .where(eq(resources.id, id))
            .returning({ id: resources.id });

        if (deleted.length === 0) {
            return NextResponse.json(
                { error: "Resource not found" },
                { status: 404 }
            );
        }

        // Delete from Pinecone
        try {
            const index = pinecone.index(indexName);
            await index.deleteOne(id);
        } catch (e) {
            console.error("Failed to delete from Pinecone:", e);
            // Don't fail the request if Pinecone delete fails
        }

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { error: "Failed to delete resource" },
            { status: 500 }
        );
    }
}

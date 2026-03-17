import { Pinecone } from "@pinecone-database/pinecone";

let _pinecone: Pinecone | null = null;

export function getPinecone(): Pinecone {
    if (!_pinecone) {
        if (!process.env.PINECONE_API_KEY) {
            console.warn(
                "PINECONE_API_KEY is missing. Vector operations will fail in production."
            );
        }
        _pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY || "",
        });
    }
    return _pinecone;
}

export const indexName = process.env.PINECONE_INDEX_NAME || "oculus";

// For backwards compatibility
export const pinecone = {
    index: (name: string) => getPinecone().index(name),
};

import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processResource, syncContextVector, deleteContextVector } from "@/lib/inngest/functions";

// This API route serves the Inngest functions so the Inngest executor can call them
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [processResource, syncContextVector, deleteContextVector],
});

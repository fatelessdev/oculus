import {
    pgTable,
    text,
    timestamp,
    uuid,
    vector,
    jsonb,
    boolean,
} from "drizzle-orm/pg-core";

export const resources = pgTable("resources", {
    id: uuid("id").defaultRandom().primaryKey(),
    url: text("url").notNull().unique(),
    title: text("title").notNull(),

    // Source and category
    sourceType: text("source_type").notNull().default("website"), // youtube_video, youtube_channel, youtube_playlist, tweet, article, github, paper, website
    category: text("category").default("reference"), // learning, reference, tool, inspiration, content

    // AI-generated content
    summary: text("summary"),
    content: text("content"), // Full scraped content
    keywords: jsonb("keywords").$type<string[]>(), // Broad + specific: ["AI", "ML", "Diffusion Models", "GSAP"]
    whySaved: text("why_saved"), // AI's guess for usefulness
    priority: text("priority").default("medium"), // high, medium, low

    // Display
    imageUrl: text("image_url"), // Unsplash image

    // Vector embedding - Google text-embedding-004 uses 768 dimensions
    embedding: vector("embedding", { dimensions: 768 }),

    // Metadata
    isCurated: boolean("is_curated").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    status: text("status").default("pending"), // pending, processing, processed, failed
});

// Personal context - key-value store for user info that AI can update
export const userContext = pgTable("user_context", {
    id: uuid("id").defaultRandom().primaryKey(),
    key: text("key").notNull().unique(), // employment_status, learning_focus, current_project, etc.
    value: text("value").notNull(), // The actual context value
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Optional cache of embeddings for personal context (kept in sync via Inngest)
export const userContextVectors = pgTable("user_context_vectors", {
    key: text("key").notNull().primaryKey(),
    embedding: vector("embedding", { dimensions: 768 }),
    lastSyncedAt: timestamp("last_synced_at").defaultNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
export type UserContext = typeof userContext.$inferSelect;
export type NewUserContext = typeof userContext.$inferInsert;

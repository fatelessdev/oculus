export type Resource = {
    id: string;
    title: string;
    url: string;
    type: "video" | "article" | "tweet" | "paper";
    summary: string;
    tags: string[];
    mentalModels: string[];
    createdAt: string;
    status: "processed" | "processing";
    imageUrl?: string;
};

const IMAGES = [
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=800",
];

export const MOCK_RESOURCES: Resource[] = [
    {
        id: "1",
        title: "The bitter lesson of AI",
        url: "http://www.incompleteideas.net/IncIdeas/BitterLesson.html",
        type: "article",
        summary:
            "Rich Sutton argues that the only thing that matters in the long run is leveraging computation. Human ingenuity is less significant than Moore's Law.",
        tags: ["AI", "Philosophy", "Compute"],
        mentalModels: ["Scale is all you need", "Search vs Learning"],
        createdAt: "2024-03-10T10:00:00Z",
        status: "processed",
        imageUrl: IMAGES[0],
    },
    {
        id: "2",
        title: "Latent Space: The specific vs generic trade-off",
        url: "https://latentspace.io",
        type: "video",
        summary:
            "An exploration of how specialized models compare to large generalist models in production environments.",
        tags: ["LLMs", "Engineering"],
        mentalModels: ["Trade-offs", "Specialization"],
        createdAt: "2024-03-12T14:30:00Z",
        status: "processed",
        imageUrl: IMAGES[1],
    },
    {
        id: "3",
        title: "Vercel AI SDK 3.0 Deep Dive",
        url: "https://vercel.com/blog",
        type: "article",
        summary:
            "Complete guide to streaming, generative UI, and RSCs with the new SDK. Covers the Core, UI, and RSC libraries.",
        tags: ["Dev", "Next.js", "AI"],
        mentalModels: ["Streaming First", "Component Generation"],
        createdAt: "2024-03-14T09:15:00Z",
        status: "processed",
        imageUrl: IMAGES[2],
    },
    {
        id: "4",
        title: "Attention is All You Need",
        url: "https://arxiv.org/abs/1706.03762",
        type: "paper",
        summary:
            "The seminal paper introducing the Transformer architecture which treats sequence transduction as a translation problem.",
        tags: ["Research", "Transformers"],
        mentalModels: ["Self-Attention", "Parallelization"],
        createdAt: "2024-03-15T11:20:00Z",
        status: "processed",
        imageUrl: IMAGES[3],
    },
    {
        id: "5",
        title: "NVIDIA GTC 2024 Keynote",
        url: "https://youtube.com/nvidia",
        type: "video",
        summary:
            "Jensen Huang announces Blackwell GPU architecture and the future of generative AI. 'This is not a chip, it's a platform.'",
        tags: ["Hardware", "GPU", "News"],
        mentalModels: ["Accelerated Computing", "Digital Twins"],
        createdAt: "2024-03-18T16:00:00Z",
        status: "processed",
        imageUrl: IMAGES[4],
    },
    {
        id: "6",
        title: "Thinking Fast and Slow in AI Agents",
        url: "https://substack.com/ai-agents",
        type: "article",
        summary:
            "Applying Kahneman's System 1 (Intuitive) and System 2 (Rational) thinking to agentic workflows to improve reliability.",
        tags: ["Agents", "Cognition"],
        mentalModels: ["System 1 vs 2", "Planning"],
        createdAt: "2024-03-19T13:45:00Z",
        status: "processed",
        imageUrl: IMAGES[0],
    },
    {
        id: "7",
        title: "Design Engineering Handbook",
        url: "https://designengineering.com",
        type: "article",
        summary:
            "Bridging the gap between Figma and React. How to build design systems that scale.",
        tags: ["Design", "Frontend"],
        mentalModels: ["Atomic Design", "Tokenization"],
        createdAt: "2024-03-20T09:00:00Z",
        status: "processed",
        imageUrl: IMAGES[1],
    },
    {
        id: "8",
        title: "Drizzle ORM: The SQL-like ORM",
        url: "https://orm.drizzle.team",
        type: "tweet",
        summary:
            "Why developers are switching from Prisma to Drizzle. It's lightweight, type-safe, and has zero runtime dependencies.",
        tags: ["Database", "TypeScript"],
        mentalModels: ["Zero Abstraction", "Type Safety"],
        createdAt: "2024-03-21T15:30:00Z",
        status: "processed",
        imageUrl: IMAGES[2],
    },
    {
        id: "9",
        title: "Groq: LPU Inference Engine",
        url: "https://groq.com",
        type: "article",
        summary:
            "Achieving 500 tokens/second with deterministic hardware. A new paradigm for real-time AI inference.",
        tags: ["Hardware", "Inference"],
        mentalModels: ["Deterministic Execution", "Latency vs Throughput"],
        createdAt: "2024-03-22T11:00:00Z",
        status: "processed",
        imageUrl: IMAGES[3],
    },
];

export const MOCK_CURATED_PATH = {
    title: "Understanding Large Language Models",
    description:
        "A structured path from basic architecture to advanced fine-tuning techniques based on your library.",
    steps: [
        {
            title: "Foundations & Architecture",
            resources: [MOCK_RESOURCES[3], MOCK_RESOURCES[0]],
            reasoning:
                "Start with the core architecture (Transformers) and the philosophical basis of why scale works (Bitter Lesson).",
        },
        {
            title: "Hardware & Infrastructure",
            resources: [MOCK_RESOURCES[8], MOCK_RESOURCES[5]],
            reasoning:
                "Understand the physical constraints and accelerators (GPUs/LPUs) that make these models possible.",
        },
        {
            title: "Production Engineering",
            resources: [MOCK_RESOURCES[2], MOCK_RESOURCES[3]],
            reasoning:
                "Move into how these models are built into applications, focusing on trade-offs and streaming UX.",
        },
    ],
};

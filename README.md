<div align="center">
  <img src="public/icon.svg" alt="Oculus Logo" width="80" height="80" />
  <h1>Oculus</h1>
  <p><strong>AI-Powered Personal Knowledge Engine</strong></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#architecture">Architecture</a>
  </p>
</div>

---

## Overview

Oculus is a production-ready, AI-powered knowledge management system that helps you curate, analyze, and explore your personal knowledge library. It uses advanced AI to extract mental models, generate semantic embeddings, and provide intelligent search across your saved resources.

## Features

### 📚 Resource Library
- Save articles, videos, papers, and tweets
- Automatic content scraping via Jina Reader
- AI-powered analysis extracts summaries, tags, and mental models
- Beautiful masonry layout with rich preview cards

### 🤖 AI Curator Agent
- Chat-based interface for knowledge exploration
- Semantic search across your entire library
- Generate curated learning paths from your resources
- Powered by NVIDIA NIM for fast inference

### 🔍 Vector Search
- Google Gemini embeddings for semantic understanding
- Pinecone vector database for lightning-fast similarity search
- Find related resources based on meaning, not just keywords

### ⚡ Background Processing
- Inngest-powered background jobs
- Multi-step agentic workflow for content ingestion
- Handles scraping, analysis, embedding, and storage

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Database** | PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/) |
| **Vector DB** | [Pinecone](https://www.pinecone.io/) |
| **AI/LLM** | [Vercel AI SDK](https://sdk.vercel.ai/), NVIDIA NIM |
| **Embeddings** | Google Gemini `text-embedding-004` |
| **Scraping** | [Jina Reader](https://jina.ai/reader) |
| **Background Jobs** | [Inngest](https://www.inngest.com/) |
| **UI Components** | Custom shadcn/ui components |

## Quick Start

### Prerequisites

- Node.js 18.18+ or 20+
- PostgreSQL database (Supabase recommended)
- API keys for: Pinecone, Google AI, NVIDIA NIM, Jina AI

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <your-repo-url>
   cd oculus
   npm install
   ```

2. **Configure environment variables**
   
   Copy `.env.example` to `.env.local` and fill in your API keys:
   
   ```bash
   cp .env.example .env.local
   ```

   Required variables:
   ```env
   DATABASE_URL=postgresql://...
   PINECONE_API_KEY=pcsk_...
   PINECONE_INDEX_NAME=oculus
   NIM_API_KEY=nvapi-...
   GOOGLE_GENERATIVE_AI_API_KEY=AIza...
   JINA_API_KEY=jina_...
   ```

3. **Set up the database**
   
   ```bash
   # Generate Drizzle migrations
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

4. **Create Pinecone index**
   
   Create an index in your Pinecone dashboard with:
   - **Dimensions**: 768 (for text-embedding-004)
   - **Metric**: Cosine
   - **Name**: `oculus` (or match your PINECONE_INDEX_NAME)

5. **Start the development server**
   
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Inngest Dev Server

For background job processing during development:

```bash
npx inngest-cli@latest dev
```

This opens the Inngest dashboard at [http://localhost:8288](http://localhost:8288).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Sidebar    │  │   Library    │  │   Curator Chat       │  │
│  │  Navigation  │  │   Cards      │  │   AI Interface       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API ROUTES                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ /api/chat    │  │/api/resources│  │   /api/inngest       │  │
│  │ AI Streaming │  │ CRUD + Queue │  │   Background Jobs    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
┌──────────────────┐                    ┌──────────────────┐
│    PostgreSQL    │                    │     Pinecone     │
│   (Drizzle ORM)  │                    │  (Vector Store)  │
│                  │                    │                  │
│  • Resources     │                    │  • Embeddings    │
│  • Metadata      │                    │  • Similarity    │
│  • Full Content  │                    │    Search        │
└──────────────────┘                    └──────────────────┘
```

### Ingestion Pipeline

When you add a new resource:

1. **Scrape** – Jina Reader fetches and converts content to markdown
2. **Analyze** – NVIDIA NIM extracts title, summary, tags, and mental models
3. **Embed** – Google Gemini generates 768-dim vector embedding
4. **Store** – Data saved to PostgreSQL, vector indexed in Pinecone

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |

## Project Structure

```
oculus/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── chat/           # AI streaming endpoint
│   │   │   ├── resources/      # Resource CRUD
│   │   │   └── inngest/        # Background jobs handler
│   │   ├── globals.css         # Tailwind v4 styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main page
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── sidebar.tsx         # Navigation sidebar
│   │   ├── resource-card.tsx   # Resource display cards
│   │   ├── curator-view.tsx    # AI chat interface
│   │   └── ...
│   └── lib/                    # Utilities & integrations
│       ├── db/                 # Drizzle ORM setup
│       ├── inngest/            # Background job functions
│       ├── pinecone.ts         # Vector DB client
│       └── utils.ts            # Helper functions
├── public/                     # Static assets
├── drizzle.config.ts           # Drizzle configuration
├── next.config.ts              # Next.js configuration
├── package.json
└── tsconfig.json
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Production

All `.env.local` variables should be set in your deployment platform.

### Inngest Production Setup

1. Create an Inngest account at [inngest.com](https://www.inngest.com/)
2. Get your signing key
3. Set `INNGEST_SIGNING_KEY` in production environment
4. Inngest will automatically discover your `/api/inngest` endpoint

## License

MIT

---

<div align="center">
  <p>Built with ❤️ using Next.js, Tailwind CSS, and AI</p>
</div>

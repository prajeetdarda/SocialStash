# SocialStash

SocialStash is an AI-powered knowledge capture platform for social and web content.
Drop in a URL from Instagram, YouTube, TikTok, X, Reddit, or any article, and SocialStash turns it into structured, searchable knowledge.

It is built to solve a common problem: valuable content gets saved everywhere but is hard to retrieve later. SocialStash converts raw links into summaries, topics, and semantic signals so users can find ideas in seconds, not scroll history for minutes.

## Project Snapshot

- **Problem solved:** turns fragmented saved links into a searchable personal knowledge layer
- **Core value:** ingestion -> AI enrichment -> hybrid retrieval in one clean product flow
- **Engineering depth:** LLM analysis, vector search, PostgreSQL indexing, and access control
- **Product mindset:** free-tier limits, secure defaults, and a roadmap aligned with user growth

## My Contribution

- Designed and implemented the end-to-end pipeline from URL ingestion to ranked retrieval
- Built API routes for analyze, search, bookmarks, and auth/user sync flows
- Integrated Apify, Claude, OpenAI embeddings, Clerk auth, and Supabase persistence
- Implemented hybrid search and data-protection patterns (RLS + user scoping)
- Structured the project for iterative delivery (extensible APIs, typed shared contracts)

## Why It Stands Out

- **Cross-platform ingestion** with a unified flow for videos, posts, threads, and articles
- **AI enrichment pipeline** that adds title, summary, topics, and language metadata
- **Hybrid retrieval model** combining semantic vector search with keyword relevance
- **Production-oriented data security** using user scoping and row-level access controls
- **Extensible architecture** designed for features like collections, recommendations, and multi-surface sharing

## Product Capabilities

- Save content from Instagram, YouTube, TikTok, X, Reddit, and web articles
- Generate AI summaries and topic tags automatically
- Search with intent (semantic) and precision (keyword)
- Keep each library private and user-scoped via Clerk + Supabase policies
- Support configurable free-tier limits with a clear path to paid growth features

## Technical Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React, Tailwind CSS |
| **Authentication** | Clerk (Google + Email sign-in) |
| **Data Layer** | Supabase (PostgreSQL) |
| **Vector Search** | pgvector (IVFFlat index) |
| **Content Ingestion** | Apify actors (platform-aware scraping) |
| **LLM Analysis** | Claude (summary + topic extraction) |
| **Embeddings** | OpenAI `text-embedding-ada-002` (1536 dimensions) |
| **Deployment** | Vercel |

## End-to-End Flow

```
URL input
  -> Platform detection + scraping (Apify)
  -> AI analysis (Claude: title, summary, topics, language)
  -> Embedding generation (OpenAI)
  -> Persist to Supabase (Postgres + pgvector)
  -> Retrieve via hybrid search (semantic + keyword)
```

## Architecture Snapshot

```
src/
  app/
    api/
      analyze/         POST  scrape + analyze + embed + save
      auth/sync/       POST  get-or-create user on login
      bookmarks/       GET   fetch current user's items
      bookmarks/[id]   DELETE remove saved item
      search/          GET   hybrid semantic + keyword search
    sign-in/           Clerk sign-in page
    sign-up/           Clerk sign-up page
    page.tsx           Main dashboard
  lib/
    apify.ts           Scraping orchestration
    llm.ts             Content analysis
    embeddings.ts      Embedding creation
    supabase.ts        Server-side DB client
    user.ts            Clerk <-> Supabase sync
    constants.ts       Product limits and defaults
    types.ts           Shared TypeScript types
  middleware.ts        Route protection
supabase/
  migrations/          Schema, indexes, RLS, search function
```

## Search Model

The retrieval layer uses PostgreSQL + pgvector with a weighted hybrid score:

```
score = 0.7 * cosine_similarity(query_embedding, row_embedding)
      + 0.3 * keyword_match_score(title, summary, topics, author)
```

This keeps results both context-aware and text-relevant, especially for short or ambiguous queries.

## Local Setup

```bash
git clone https://github.com/prajeetdarda/SocialStash.git
cd SocialStash
npm install
```

Create `.env.local`:

```
APIFY_TOKEN=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

Run migrations from `supabase/migrations/` in order, then start:

```bash
npm run dev
```

## Current Scope and Next Milestones

SocialStash currently focuses on high-quality saving, enrichment, and retrieval for individual users.
Planned expansions include:

- Collections and folder-level organization
- Similar-content discovery ("find related saves")
- Browser extension for one-click capture
- Mobile share-to-save experience

## Author

**Prajeet Darda** - [LinkedIn](https://www.linkedin.com/in/prajeet-darda) | [Portfolio](https://prajeetdarda.github.io/) | [GitHub](https://github.com/prajeetdarda)

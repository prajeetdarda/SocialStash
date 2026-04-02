# SocialStash

Save content from any platform. AI analyzes, categorizes, and makes it searchable.

Paste an Instagram reel, YouTube video, tweet, TikTok, Reddit thread, or any URL — SocialStash scrapes the content, generates an AI-powered summary with topics, and stores it in a searchable personal library with hybrid semantic + keyword search.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React, Tailwind CSS |
| **Auth** | Clerk (Google + Email sign-in) |
| **Database** | Supabase (PostgreSQL) |
| **Vector Search** | pgvector with IVFFlat indexing |
| **Scraping** | Apify (platform-specific actors) |
| **AI Analysis** | Claude (Anthropic) — content summarization & topic extraction |
| **Embeddings** | OpenAI `text-embedding-ada-002` (1536-dim) |
| **Deployment** | Vercel |

## How It Works

```
User pastes URL
  -> Apify scrapes content (auto-detects platform)
  -> Claude analyzes: generates title, summary, topics, language
  -> OpenAI generates vector embedding from summary + topics
  -> Everything saved to Supabase (PostgreSQL + pgvector)
  -> Hybrid search: 70% semantic similarity + 30% keyword relevance
```

## Features

- **Multi-platform support** — Instagram (posts/reels), YouTube, TikTok, Twitter/X, Reddit, any web article
- **AI-powered analysis** — auto-generated titles, summaries, topic tags, language detection
- **Hybrid search** — combines vector cosine similarity with keyword matching, weighted 70/30
- **Auth & user scoping** — Clerk authentication, each user sees only their own data
- **Secure by default** — Supabase RLS enabled, service role key server-side only
- **Free tier** — configurable save limit with upgrade prompt

## Architecture

```
src/
  app/
    api/
      analyze/       POST — scrape + analyze + embed + save
      auth/sync/     POST — get-or-create user on login
      bookmarks/     GET  — fetch user's saved items
      bookmarks/[id] DELETE — remove a bookmark
      search/        GET  — hybrid semantic + keyword search
    sign-in/         Clerk sign-in UI
    sign-up/         Clerk sign-up UI
    page.tsx         Main dashboard
  lib/
    apify.ts         Platform-specific scraping logic
    llm.ts           Claude content analysis
    embeddings.ts    OpenAI vector generation
    supabase.ts      DB client (service role)
    user.ts          Clerk <-> Supabase user sync
    constants.ts     Free tier config
    types.ts         Shared TypeScript types
  middleware.ts      Route protection via Clerk
supabase/
  migrations/        SQL schema, search function, RLS policies
```

## Database Schema

**users** — clerk_id, email, created_at

**analyses** — source_url, platform, content_type, title, summary, topics (TEXT[] with GIN index), author, language, embedding (VECTOR(1536) with IVFFlat index), created_at

Search uses a PostgreSQL function (`search_analyses`) that scores results as:
```
score = 0.7 * cosine_similarity(query_embedding, row_embedding)
      + 0.3 * keyword_match_score(title, summary, topics, author)
```

## Local Development

```bash
git clone https://github.com/prajeetdarda/SocialStash.git
cd SocialStash
npm install
```

Create `.env.local` with:
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

Run the SQL migrations in `supabase/migrations/` (in order) via Supabase SQL Editor.

```bash
npm run dev
```

## Roadmap

- Mobile app — share from any app, analysis happens in the background
- Browser extension — one-click save while browsing
- Collections & folders
- "Find similar" — discover related saves across platforms
- Unlimited saves with Pro plan

## Author

**Prajeet Darda** — [LinkedIn](https://www.linkedin.com/in/prajeet-darda) | [Portfolio](https://prajeetdarda.github.io/) | [GitHub](https://github.com/prajeetdarda)

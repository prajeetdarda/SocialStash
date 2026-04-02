-- ============================================================
-- SocialStash — Initial Schema
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Enable the pgvector extension (for embeddings)
create extension if not exists vector;

-- 2. Users table
create table users (
  id         uuid primary key default gen_random_uuid(),
  clerk_id   text unique not null,
  email      text,
  created_at timestamptz default now()
);

-- 3. Analyses table
create table analyses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  source_url   text not null,
  platform     text not null,
  content_type text,
  title        text,
  summary      text,
  topics       text[],
  author       text,
  language     text,
  embedding    vector(1536),
  created_at   timestamptz default now()
);

-- 4. Indexes for fast queries
create index idx_analyses_user_id  on analyses(user_id);
create index idx_analyses_platform on analyses(platform);
create index idx_analyses_topics   on analyses using gin(topics);

-- 5. Vector similarity index (ivfflat)
--    Note: This index works best after you have ~1000+ rows.
--    It's safe to create now — it just won't speed things up until then.
create index idx_analyses_embedding on analyses using ivfflat(embedding vector_cosine_ops)
  with (lists = 100);

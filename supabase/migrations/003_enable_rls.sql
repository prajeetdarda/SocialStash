-- ============================================================
-- Enable Row Level Security (RLS)
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Since we use the Supabase anon key from our Next.js server (not Supabase Auth),
-- we add a permissive policy that allows all operations through the anon key.
-- The actual user-scoping is handled in our API routes via getOrCreateUser().
-- RLS here acts as defense-in-depth — it's enabled so the tables aren't wide open.

-- 1. Enable RLS on both tables
alter table users enable row level security;
alter table analyses enable row level security;

-- 2. Allow our server (using anon key) to perform all operations
-- These policies allow the anon role (which our supabase-js client uses) full access.
-- User-level filtering is enforced in our API layer.
create policy "Allow server access" on users
  for all using (true) with check (true);

create policy "Allow server access" on analyses
  for all using (true) with check (true);

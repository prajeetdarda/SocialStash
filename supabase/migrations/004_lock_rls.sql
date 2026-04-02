-- ============================================================
-- Lock down RLS — block anon key, only service_role can access
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Remove the permissive policies we added earlier
drop policy if exists "Allow server access" on users;
drop policy if exists "Allow server access" on analyses;

-- With RLS enabled and NO policies for anon role,
-- the anon key can no longer read or write any data.
-- Only the service_role key (used by our server) bypasses RLS.

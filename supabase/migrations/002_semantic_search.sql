-- ============================================================
-- Semantic search function (hybrid: keyword + semantic)
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Hybrid search: combines keyword relevance (30%) with semantic similarity (70%).
-- Keyword match doesn't filter results out — it boosts them.
-- So searching "fitness" still finds "workout routine" via embeddings,
-- but exact keyword matches get ranked higher.

create or replace function search_analyses(
  p_user_id uuid,
  p_embedding vector(1536),
  p_query text default '',
  p_match_count int default 20
)
returns table (
  id uuid,
  source_url text,
  platform text,
  content_type text,
  title text,
  summary text,
  topics text[],
  author text,
  language text,
  created_at timestamptz,
  similarity float
)
language plpgsql
as $$
begin
  return query
    select
      a.id,
      a.source_url,
      a.platform,
      a.content_type,
      a.title,
      a.summary,
      a.topics,
      a.author,
      a.language,
      a.created_at,
      -- Hybrid score: 70% semantic + 30% keyword
      (
        0.7 * (1 - (a.embedding <=> p_embedding))
        + 0.3 * (
          case when p_query = '' then 0
          else (
            (case when a.title ilike '%' || p_query || '%' then 1.0 else 0.0 end)
            + (case when a.summary ilike '%' || p_query || '%' then 0.8 else 0.0 end)
            + (case when a.author ilike '%' || p_query || '%' then 0.5 else 0.0 end)
            + (case when exists (
                select 1 from unnest(a.topics) t where t ilike '%' || p_query || '%'
              ) then 1.0 else 0.0 end)
          ) / 3.3  -- normalize to 0-1 range (max possible = 1+0.8+0.5+1 = 3.3)
          end
        )
      ) as similarity
    from analyses a
    where a.user_id = p_user_id
      and a.embedding is not null
    order by similarity desc
    limit p_match_count;
end;
$$;

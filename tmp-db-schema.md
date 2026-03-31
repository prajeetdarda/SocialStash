# Database Schema (Draft)

## `users` — 4 columns

| Column     | Type           | Constraints      | Why                          |
|------------|----------------|------------------|------------------------------|
| id         | UUID           | PK, auto-gen     | Auto-generated               |
| clerk_id   | TEXT           | UNIQUE, NOT NULL | Maps Clerk auth to our DB    |
| email      | TEXT           |                  | Display only, synced from Clerk |
| created_at | TIMESTAMPTZ    | DEFAULT now()    | Account creation timestamp   |

## `analyses` — 12 columns

| Column       | Type           | Constraints / Index      | Why                                                        |
|--------------|----------------|--------------------------|------------------------------------------------------------|
| id           | UUID           | PK, auto-gen             | Auto-generated                                             |
| user_id      | UUID           | FK -> users.id, INDEX    | Whose bookmark is this                                     |
| source_url   | TEXT           | NOT NULL                 | Original URL user saved                                    |
| platform     | TEXT           | NOT NULL, INDEX          | 'instagram' \| 'tiktok' \| 'youtube' \| 'twitter' \| 'reddit' \| 'web' |
| content_type | TEXT           |                          | 'post' \| 'reel' \| 'video' \| 'tweet' \| 'thread' \| 'article' \| 'unknown' |
| title        | TEXT           |                          | Short title for the content (confirmed in types.ts)        |
| summary      | TEXT           |                          | LLM's 2-3 sentence description                            |
| topics       | TEXT[]         | GIN index                | ['fitness', 'morning routine'] — primary filter for browsing |
| author       | TEXT           |                          | Username or name of content creator                        |
| language     | TEXT           |                          | ISO 639-1 code ('en', 'es', 'hi', etc.)                   |
| embedding    | VECTOR(1536)   | ivfflat index            | Generated from summary + topics. For "find similar"        |
| created_at   | TIMESTAMPTZ    | DEFAULT now()            | When user saved this                                       |

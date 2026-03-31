// Supported platforms
export type Platform =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "twitter"
  | "reddit"
  | "web";

// Content types per platform
export type ContentType =
  | "post"
  | "reel"
  | "video"
  | "tweet"
  | "thread"
  | "article"
  | "unknown";

// Matches the `analyses` table schema (minus id, user_id, embedding, created_at)
export interface AnalysisResult {
  source_url: string;
  platform: Platform;
  content_type: ContentType;
  title: string;
  summary: string;
  topics: string[];
  author: string;
  language: string;
}

// What we extract from Apify before sending to LLM
export interface ScrapedData {
  url: string;
  platform: Platform;
  content_type: ContentType;
  author: string;
  text_content: string; // caption, description, tweet text, article body, etc.
  hashtags: string[];
  display_urls?: string[]; // images for posts, thumbnails for videos
  extra?: Record<string, unknown>; // platform-specific metadata (views, likes, etc.)
}

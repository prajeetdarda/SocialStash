// Matches the `analyses` table schema (minus id, user_id, embedding, created_at)
export interface AnalysisResult {
  source_url: string;
  platform: "instagram";
  content_type: "post" | "reel";
  title: string;
  summary: string;
  topics: string[];
  author: string;
  language: string;
}

// What we extract from Apify before sending to LLM
export interface ScrapedData {
  url: string;
  content_type: "post" | "reel";
  author: string;
  caption: string;
  hashtags: string[];
  display_urls?: string[]; // post: all carousel images, reel: thumbnail
}

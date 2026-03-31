import { ApifyClient } from "apify-client";
import { ScrapedData, Platform, ContentType } from "./types";

const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

// ── URL Detection ────────────────────────────────────────────────────────────

interface RouteResult {
  platform: Platform;
  content_type: ContentType;
}

function detectPlatform(url: string): RouteResult {
  const u = url.toLowerCase();

  // Instagram
  if (u.includes("instagram.com") || u.includes("instagr.am")) {
    if (u.includes("/reel/") || u.includes("/reels/"))
      return { platform: "instagram", content_type: "reel" };
    if (u.includes("/p/"))
      return { platform: "instagram", content_type: "post" };
    return { platform: "instagram", content_type: "post" };
  }

  // YouTube
  if (
    u.includes("youtube.com") ||
    u.includes("youtu.be") ||
    u.includes("youtube-nocookie.com")
  ) {
    return { platform: "youtube", content_type: "video" };
  }

  // TikTok
  if (u.includes("tiktok.com")) {
    return { platform: "tiktok", content_type: "video" };
  }

  // Twitter / X
  if (
    u.includes("twitter.com") ||
    u.includes("x.com") ||
    u.includes("t.co")
  ) {
    return { platform: "twitter", content_type: "tweet" };
  }

  // Reddit
  if (u.includes("reddit.com") || u.includes("redd.it")) {
    return { platform: "reddit", content_type: "thread" };
  }

  // Everything else
  return { platform: "web", content_type: "article" };
}

// ── Platform-specific scrapers ───────────────────────────────────────────────

async function scrapeInstagram(
  url: string,
  contentType: ContentType
): Promise<ScrapedData> {
  const actorId =
    contentType === "reel"
      ? "apify/instagram-reel-scraper"
      : "apify/instagram-post-scraper";

  const run = await client.actor(actorId).call({
    username: [url],
    resultsLimit: 1,
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  if (items.length === 0) throw new Error("Apify returned no results.");

  const item = items[0] as Record<string, unknown>;

  const caption = (item.caption as string) || "";
  const hashtags =
    (item.hashtags as string[]) ||
    caption.match(/#\w+/g)?.map((h) => h.slice(1)) ||
    [];
  const author =
    (item.ownerUsername as string) ||
    (item.ownerFullName as string) ||
    "unknown";

  // Images: carousel for posts, thumbnail for reels
  let display_urls: string[] | undefined;
  if (contentType === "post") {
    const images = item.images as string[] | undefined;
    if (images && images.length > 0) {
      display_urls = images;
    } else {
      const single =
        (item.displayUrl as string) || (item.imageUrl as string);
      if (single) display_urls = [single];
    }
  } else {
    const thumbnail = item.displayUrl as string | undefined;
    if (thumbnail) display_urls = [thumbnail];
  }

  return {
    url,
    platform: "instagram",
    content_type: contentType,
    author,
    text_content: caption,
    hashtags,
    display_urls,
  };
}

async function scrapeYouTube(url: string): Promise<ScrapedData> {
  const run = await client.actor("streamers/youtube-scraper").call({
    startUrls: [{ url }],
    maxResults: 1,
    maxResultsShorts: 0,
    maxResultStreams: 0,
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  if (items.length === 0) throw new Error("Apify returned no results.");

  const item = items[0] as Record<string, unknown>;

  const title = (item.title as string) || "";
  const description = (item.text as string) || "";
  const channelName = (item.channelName as string) || "unknown";
  const hashtags = (item.hashtags as string[]) || [];
  const thumbnailUrl = item.thumbnailUrl as string | undefined;

  return {
    url,
    platform: "youtube",
    content_type: "video",
    author: channelName,
    text_content: `${title}\n\n${description}`,
    hashtags: hashtags.map((h) => h.replace(/^#/, "")),
    display_urls: thumbnailUrl ? [thumbnailUrl] : undefined,
    extra: {
      title,
      viewCount: item.viewCount,
      likes: item.likes,
      duration: item.duration,
      date: item.date,
    },
  };
}

// ── Catch-all web scraper ────────────────────────────────────────────────────
// Used for: TikTok, Twitter/X, Reddit, and any unknown URL
// These platforms block free scrapers, so we extract whatever we can.

async function scrapeCatchAll(
  url: string,
  platform: Platform,
  contentType: ContentType
): Promise<ScrapedData> {
  try {
    const run = await client.actor("apify/website-content-crawler").call({
      startUrls: [{ url }],
      maxCrawlPages: 1,
      crawlerType: "cheerio",
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (items.length > 0) {
      const item = items[0] as Record<string, unknown>;
      const meta = (item.metadata as Record<string, unknown>) || {};
      const text = (item.text as string) || "";
      const title = (meta.title as string) || "";
      const description = (meta.description as string) || "";

      return {
        url,
        platform,
        content_type: contentType,
        author: extractAuthorFromUrl(url, platform),
        text_content: text || `${title}\n\n${description}`,
        hashtags: [],
        extra: { title, description },
      };
    }
  } catch {
    // Scraping failed — fall through to minimal data
  }

  // Minimal fallback: save the URL with whatever we can parse from it
  return {
    url,
    platform,
    content_type: contentType,
    author: extractAuthorFromUrl(url, platform),
    text_content: "",
    hashtags: [],
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractAuthorFromUrl(url: string, platform: Platform): string {
  try {
    const path = new URL(url).pathname;
    switch (platform) {
      case "tiktok": {
        // tiktok.com/@username/video/123
        const match = path.match(/\/@([^/]+)/);
        return match ? match[1] : "unknown";
      }
      case "twitter": {
        // x.com/username/status/123
        const parts = path.split("/").filter(Boolean);
        return parts[0] || "unknown";
      }
      case "reddit": {
        // reddit.com/r/subreddit/comments/...
        const match = path.match(/\/r\/([^/]+)/);
        return match ? `r/${match[1]}` : "unknown";
      }
      default:
        return "unknown";
    }
  } catch {
    return "unknown";
  }
}

// ── Main export ──────────────────────────────────────────────────────────────

export async function scrapeUrl(url: string): Promise<ScrapedData> {
  const { platform, content_type } = detectPlatform(url);

  switch (platform) {
    case "instagram":
      return scrapeInstagram(url, content_type);
    case "youtube":
      return scrapeYouTube(url);
    // TikTok, Twitter, Reddit → catch-all (specific actors need paid plans)
    case "tiktok":
    case "twitter":
    case "reddit":
    case "web":
    default:
      return scrapeCatchAll(url, platform, content_type);
  }
}

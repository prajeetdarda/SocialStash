import { ApifyClient } from "apify-client";
import { ScrapedData } from "./types";

const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

function detectContentType(url: string): "post" | "reel" {
  if (url.includes("/reel/") || url.includes("/reels/")) return "reel";
  if (url.includes("/p/")) return "post";
  throw new Error(
    "Unsupported Instagram URL. Must contain /p/ (post) or /reel/ (reel)."
  );
}

export async function scrapeInstagram(url: string): Promise<ScrapedData> {
  const contentType = detectContentType(url);

  const actorId =
    contentType === "reel"
      ? "apify/instagram-reel-scraper"
      : "apify/instagram-post-scraper";

  const run = await client.actor(actorId).call({
    username: [url],
    resultsLimit: 1,
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  if (items.length === 0) {
    throw new Error("Apify returned no results for this URL.");
  }

  const item = items[0] as Record<string, unknown>;

  // Extract fields common to both actors
  const caption = (item.caption as string) || "";
  const hashtags =
    (item.hashtags as string[]) ||
    caption.match(/#\w+/g)?.map((h: string) => h.slice(1)) ||
    [];
  const author =
    (item.ownerUsername as string) ||
    (item.ownerFullName as string) ||
    "unknown";

  const scraped: ScrapedData = {
    url,
    content_type: contentType,
    author,
    caption,
    hashtags,
  };

  if (contentType === "post") {
    // Carousel posts have images array, single posts have displayUrl
    const images = item.images as string[] | undefined;
    if (images && images.length > 0) {
      scraped.display_urls = images;
    } else {
      const single = (item.displayUrl as string) || (item.imageUrl as string);
      if (single) scraped.display_urls = [single];
    }
  }

  if (contentType === "reel") {
    // Reel thumbnail for visual context
    const thumbnail = item.displayUrl as string | undefined;
    if (thumbnail) scraped.display_urls = [thumbnail];
  }

  return scraped;
}

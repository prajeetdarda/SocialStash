import { ApifyClient } from "apify-client";

const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

const url = process.argv[2] || "https://www.instagram.com/p/example/";

// Detect which actor to use
const isReel = url.includes("/reel/") || url.includes("/reels/");
const actorId = isReel
  ? "apify/instagram-reel-scraper"
  : "apify/instagram-post-scraper";

async function main() {
  console.log(`Scraping: ${url}`);
  console.log(`Actor: ${actorId}\n`);

  const run = await client.actor(actorId).call({
    username: [url],
    resultsLimit: 1,
  });

  console.log(`Run finished. Dataset ID: ${run.defaultDatasetId}\n`);

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  console.log(`Got ${items.length} item(s):\n`);
  console.log(JSON.stringify(items, null, 2));
}

main().catch(console.error);

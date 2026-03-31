import { ApifyClient } from "apify-client";

const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

const urls = [
  { name: "TikTok", url: "https://www.tiktok.com/@zachking/video/7478773498880265518" },
  { name: "Twitter/X", url: "https://x.com/elonmusk/status/1861446800666911182" },
  { name: "Reddit", url: "https://www.reddit.com/r/webdev/comments/1jm2k5q/what_is_the_most_overengineered_thing_youve_seen/" },
];

const target = process.argv[2]?.toLowerCase();

async function test(name: string, url: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Catch-all test: ${name}`);
  console.log(`URL: ${url}`);
  console.log(`${"=".repeat(60)}\n`);

  const run = await client.actor("apify/website-content-crawler").call({
    startUrls: [{ url }],
    maxCrawlPages: 1,
    crawlerType: "playwright:chrome",
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  if (items.length > 0) {
    const item = items[0] as Record<string, unknown>;
    const meta = item.metadata as Record<string, unknown> | null;
    console.log("Title:", meta?.title || "(none)");
    console.log("Description:", meta?.description || "(none)");
    console.log("Language:", meta?.languageCode || "(none)");
    const text = (item.text as string) || "";
    console.log(`Text preview (${text.length} chars): ${text.slice(0, 300)}...`);

    const fs = await import("fs");
    fs.writeFileSync(
      `test-catchall-${name.toLowerCase().replace(/[\s/]/g, "-")}.json`,
      JSON.stringify(items[0], null, 2)
    );
    console.log(`\nSaved to test-catchall-${name.toLowerCase().replace(/[\s/]/g, "-")}.json`);
  } else {
    console.log("No items returned!");
  }
}

async function main() {
  const toRun = target ? urls.filter(u => u.name.toLowerCase().includes(target)) : urls;
  for (const u of toRun) {
    try {
      await test(u.name, u.url);
    } catch (err) {
      console.error(`FAILED: ${err instanceof Error ? err.message : err}`);
    }
  }
}

main().catch(console.error);

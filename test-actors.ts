import { ApifyClient } from "apify-client";

const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

const tests = [
  {
    name: "TikTok",
    actorId: "clockworks/tiktok-video-scraper",
    input: {
      postURLs: ["https://www.tiktok.com/@zachking/video/7478773498880265518"],
    },
  },
  {
    name: "YouTube",
    actorId: "streamers/youtube-scraper",
    input: {
      startUrls: [{ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }],
      maxResults: 1,
      maxResultsShorts: 0,
      maxResultStreams: 0,
    },
  },
  {
    name: "Twitter/X",
    actorId: "apidojo/tweet-scraper",
    input: {
      startUrls: [{ url: "https://x.com/elonmusk/status/1861446800666911182" }],
      maxItems: 1,
    },
  },
  {
    name: "Reddit",
    actorId: "trudax/reddit-scraper",
    input: {
      startUrls: [{ url: "https://www.reddit.com/r/webdev/comments/1jm2k5q/what_is_the_most_overengineered_thing_youve_seen/" }],
      maxItems: 1,
      maxComments: 0,
    },
  },
  {
    name: "General Web",
    actorId: "apify/website-content-crawler",
    input: {
      startUrls: [{ url: "https://blog.apify.com/what-is-web-scraping/" }],
      maxCrawlPages: 1,
      crawlerType: "cheerio",
    },
  },
];

// Run a specific test or all
const targetName = process.argv[2]?.toLowerCase();

async function runTest(test: (typeof tests)[0]) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Testing: ${test.name} (${test.actorId})`);
  console.log(`${"=".repeat(60)}\n`);

  try {
    const run = await client.actor(test.actorId).call(test.input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`Got ${items.length} item(s)`);

    if (items.length > 0) {
      // Print just the top-level keys and their types/previews
      const item = items[0] as Record<string, unknown>;
      console.log(`\nTop-level fields:`);
      for (const [key, value] of Object.entries(item)) {
        const type = Array.isArray(value)
          ? `array[${value.length}]`
          : typeof value;
        const preview =
          typeof value === "string"
            ? value.slice(0, 80) + (value.length > 80 ? "..." : "")
            : Array.isArray(value)
            ? JSON.stringify(value.slice(0, 2))
            : JSON.stringify(value);
        console.log(`  ${key} (${type}): ${preview}`);
      }

      // Also dump the full first item to a file for inspection
      const fs = await import("fs");
      fs.writeFileSync(
        `test-output-${test.name.toLowerCase().replace(/[\s/]/g, "-")}.json`,
        JSON.stringify(items[0], null, 2)
      );
      console.log(`\nFull output saved to test-output-${test.name.toLowerCase().replace(/[\s/]/g, "-")}.json`);
    }
  } catch (err) {
    console.error(`FAILED:`, err instanceof Error ? err.message : err);
  }
}

async function main() {
  const toRun = targetName
    ? tests.filter((t) => t.name.toLowerCase().includes(targetName))
    : tests;

  if (toRun.length === 0) {
    console.log(`No test found for "${targetName}". Available: ${tests.map((t) => t.name).join(", ")}`);
    return;
  }

  for (const test of toRun) {
    await runTest(test);
  }
}

main().catch(console.error);

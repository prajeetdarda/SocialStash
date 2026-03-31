import { NextRequest, NextResponse } from "next/server";
import { scrapeUrl } from "@/lib/apify";
import { analyzeContent } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing url field" }, { status: 400 });
    }

    // Validate it looks like a URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Step 1: Scrape via Apify (auto-detects platform)
    const scraped = await scrapeUrl(url);

    // Step 2: Analyze via LLM
    const analysis = await analyzeContent(scraped);

    // Step 3: Return structured result (DB insert will go here later)
    return NextResponse.json({ scraped, analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

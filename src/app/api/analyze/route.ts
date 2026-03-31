import { NextRequest, NextResponse } from "next/server";
import { scrapeInstagram } from "@/lib/apify";
import { analyzeContent } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing url field" }, { status: 400 });
    }

    if (!url.includes("instagram.com")) {
      return NextResponse.json(
        { error: "Only Instagram URLs are supported for now" },
        { status: 400 }
      );
    }

    // Step 1: Scrape via Apify
    const scraped = await scrapeInstagram(url);

    // Step 2: Analyze via LLM
    const analysis = await analyzeContent(scraped);

    // Step 3: Return structured result (DB insert will go here later)
    return NextResponse.json({ scraped, analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

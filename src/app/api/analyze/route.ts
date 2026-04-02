import { NextRequest, NextResponse } from "next/server";
import { scrapeUrl } from "@/lib/apify";
import { analyzeContent } from "@/lib/llm";
import { generateEmbedding } from "@/lib/embeddings";
import { supabase } from "@/lib/supabase";
import { getOrCreateUser } from "@/lib/user";
import { FREE_SAVE_LIMIT } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    // Get the logged-in user's DB id (creates user row on first call)
    const userId = await getOrCreateUser();

    // Check free tier limit
    const { count } = await supabase
      .from("analyses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (count !== null && count >= FREE_SAVE_LIMIT) {
      return NextResponse.json(
        { error: "limit_reached", message: `You've reached the free limit of ${FREE_SAVE_LIMIT} saves. Upgrade coming soon!` },
        { status: 403 }
      );
    }

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

    // Step 3: Generate embedding from summary + topics
    const embedding = await generateEmbedding(analysis.summary, analysis.topics);

    // Step 4: Save to Supabase (with embedding)
    const { error } = await supabase.from("analyses").insert({
      user_id: userId,
      source_url: analysis.source_url,
      platform: analysis.platform,
      content_type: analysis.content_type,
      title: analysis.title,
      summary: analysis.summary,
      topics: analysis.topics,
      author: analysis.author,
      language: analysis.language,
      embedding,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 });
    }

    return NextResponse.json({ scraped, analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

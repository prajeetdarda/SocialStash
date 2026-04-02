import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/embeddings";
import { supabase } from "@/lib/supabase";
import { getOrCreateUser } from "@/lib/user";

export async function GET(req: NextRequest) {
  try {
    const userId = await getOrCreateUser();
    const query = req.nextUrl.searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ items: [] });
    }

    // Generate embedding for the search query
    const embedding = await generateEmbedding(query, []);

    // Call our Supabase RPC function (semantic + keyword hybrid search)
    const { data, error } = await supabase.rpc("search_analyses", {
      p_user_id: userId,
      p_embedding: embedding,
      p_query: query,
      p_match_count: 20,
    });

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

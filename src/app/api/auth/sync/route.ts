import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    const userId = await getOrCreateUser();

    // Fetch bookmarks in the same call so frontend doesn't need a second request
    const { data, error } = await supabase
      .from("analyses")
      .select("id, source_url, platform, content_type, title, summary, topics, author, language, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ userId, items: [], hasData: false });
    }

    return NextResponse.json({
      userId,
      items: data ?? [],
      hasData: (data?.length ?? 0) > 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

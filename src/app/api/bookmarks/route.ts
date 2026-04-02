import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getOrCreateUser } from "@/lib/user";

export async function GET() {
  try {
    const userId = await getOrCreateUser();

    const { data, error } = await supabase
      .from("analyses")
      .select("id, source_url, platform, content_type, title, summary, topics, author, language, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

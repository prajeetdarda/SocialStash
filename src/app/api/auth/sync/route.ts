import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";

export async function POST() {
  try {
    const userId = await getOrCreateUser();
    return NextResponse.json({ userId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

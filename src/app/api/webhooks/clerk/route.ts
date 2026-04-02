import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    return NextResponse.json(
      { error: "Missing CLERK_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  // Verify the webhook signature (proves it came from Clerk, not a random request)
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(SIGNING_SECRET);

  let event: { type: string; data: Record<string, unknown> };

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle user.created — insert a row in our users table
  if (event.type === "user.created") {
    const { id: clerkId, email_addresses } = event.data as {
      id: string;
      email_addresses: { email_address: string }[];
    };

    const email = email_addresses?.[0]?.email_address ?? null;

    const { error } = await supabase.from("users").insert({
      clerk_id: clerkId,
      email,
    });

    if (error) {
      console.error("Failed to create user:", error);
      return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

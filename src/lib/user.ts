import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "./supabase";

/**
 * Gets or creates the DB user for the currently logged-in Clerk user.
 * Call this in any server-side code that needs user_id.
 */
export async function getOrCreateUser(): Promise<string> {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Not authenticated");
  }

  // Check if user already exists in our DB
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (existing) {
    return existing.id;
  }

  // First time — create the user
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;

  const { data: newUser, error } = await supabase
    .from("users")
    .insert({ clerk_id: clerkId, email })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return newUser.id;
}

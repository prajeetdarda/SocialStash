import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-only client using service role key — never exposed to the browser.
// Bypasses RLS, so all user-scoping is handled in our API routes.
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

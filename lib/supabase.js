import { createClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseServiceKey } from "./env";

// Server-only client. Uses the service role key, which bypasses RLS.
// Never import this file from a client component.
let client;
export function db() {
  if (!client) {
    const url = supabaseUrl();
    const key = supabaseServiceKey();
    if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

// This store shares the Supabase project with DAFA but keeps its own table.
export const TABLE = "saw_orders";

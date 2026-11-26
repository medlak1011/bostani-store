// Finds Supabase settings whatever prefix the Vercel ↔ Supabase integration used
// (e.g. SUPABASE_URL, STORAGE_SUPABASE_URL, SUPABASE_SUPABASE_URL…). Server-only.
function find(exact, re) {
  if (process.env[exact]) return process.env[exact];
  const k = Object.keys(process.env).find((n) => re.test(n) && process.env[n]);
  return k ? process.env[k] : undefined;
}
export const supabaseUrl = () =>
  find("SUPABASE_URL", /(^|_)SUPABASE_URL$/) || find("NEXT_PUBLIC_SUPABASE_URL", /NEXT_PUBLIC_.*SUPABASE_URL$/);
export const supabaseServiceKey = () =>
  find("SUPABASE_SERVICE_ROLE_KEY", /SERVICE_ROLE_KEY$/) || find("SUPABASE_SECRET_KEY", /SUPABASE_SECRET_KEY$/);

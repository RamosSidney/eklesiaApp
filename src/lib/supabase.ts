import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnon)

// Client-side helper (usa anon key)
export function getSupabaseClient() {
  return createClient<Database>(supabaseUrl, supabaseAnon)
}

import { createClient } from '@supabase/supabase-js'

// Hardcoded for Vercel production reliability
const supabaseUrl = 'https://yvqnjttpoiyxdybdwpcm.supabase.co'
const supabaseAnonKey = 'sb_publishable_1mV4wOJQkWTpLyM9uZCpag_NjkzV5NN' // <-- Paste your full anon key here if it differs, or use import.meta.env as fallback

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || supabaseUrl, 
  import.meta.env.VITE_SUPABASE_ANON_KEY || supabaseAnonKey
)
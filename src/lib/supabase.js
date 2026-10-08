import { createClient } from '@supabase/supabase-js'

// Bulletproof production fallbacks so Vercel never fails to connect
const supabaseUrl = 'https://yvqnjttpoiyxdybdwpcm.supabase.co'
const supabaseAnonKey = 'sb_publishable_1mV4wOJQkWTpLyM9uZCpag_NjkzV5NN'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || supabaseUrl,
  import.meta.env.VITE_SUPABASE_ANON_KEY || supabaseAnonKey
)
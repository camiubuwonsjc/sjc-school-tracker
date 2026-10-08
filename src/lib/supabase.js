import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yvqnjttpoiyxdybdwpcm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_1mV4wOJQkWTpLyM9uZCpag_NjkzV5NN';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
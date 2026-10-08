import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yvqnjttpoiyxdybdwpcm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2cW5qdHRwb2l5eGR5YmR3cGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU5Nzg5MjYsImV4cCI6MjAzMTU1NDkyNn0.Vcj...'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
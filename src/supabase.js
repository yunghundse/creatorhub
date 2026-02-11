import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lvqtomawmgqbqjviuexo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cXRvbWF3bWdxYnFqdml1ZXhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MjMwMTEsImV4cCI6MjA4NjM5OTAxMX0.KVVZmF2p1wEOK2a6tssL0CoWXKRuzS7Fb1cDg8HDuDE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const SUPABASE_BUCKET = 'uploads'
export { supabaseUrl }

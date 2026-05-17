import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ahkkemuhsdadejdmzyle.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoa2tlbXVoc2RhZGVqZG16eWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTM0MzcsImV4cCI6MjA5NDMyOTQzN30.BCAqtUcA_FbZ2DuD2enZQYxCtG87HkvTsW1IwabTebE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
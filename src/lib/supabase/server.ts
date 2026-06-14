import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    'https://ahkkemuhsdadejdmzyle.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoa2tlbXVoc2RhZGVqZG16eWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTM0MzcsImV4cCI6MjA5NDMyOTQzN30.BCAqtUcA_FbZ2DuD2enZQYxCtG87HkvTsW1IwabTebE',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component 中无法设置 cookie，忽略
          }
        },
      },
    }
  )
}

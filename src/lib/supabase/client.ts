import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ahkkemuhsdadejdmzyle.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoa2tlbXVoc2RhZGVqZG16eWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTM0MzcsImV4cCI6MjA5NDMyOTQzN30.BCAqtUcA_FbZ2DuD2enZQYxCtG87HkvTsW1IwabTebE'
  )
}

// 辅助函数：等待 session 准备就绪
export async function waitForSession(supabase: ReturnType<typeof createClient>, timeout = 2000) {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) return session
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  return null
}

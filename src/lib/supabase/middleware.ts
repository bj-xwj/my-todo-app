import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 创建响应对象
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ahkkemuhsdadejdmzyle.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoa2tlbXVoc2RhZGVqZG16eWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NTM0MzcsImV4cCI6MjA5NDMyOTQzN30.BCAqtUcA_FbZ2DuD2enZQYxCtG87HkvTsW1IwabTebE',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          // 在响应对象上设置 cookie
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({
              name,
              value,
              sameSite: 'lax',
              secure: true, // Vercel 强制 HTTPS
              path: '/',
              ...options,
            })
          })
        },
      },
    }
  )

  // 获取用户信息
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 未登录且不在登录/注册页面，重定向到登录
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/register') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return response
}

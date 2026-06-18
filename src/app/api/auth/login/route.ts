import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    // 解析请求中的 cookies
    const cookieHeader = request.headers.get('cookie') || ''
    const requestCookies = cookieHeader.split('; ').filter(Boolean).map(cookie => {
      const [name, ...valueParts] = cookie.split('=')
      return { name, value: valueParts.join('=') }
    })
    
    // 收集要设置的 cookies
    const cookiesToSet: Array<{ name: string; value: string; options?: any }> = []
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return requestCookies
          },
          setAll(cookies: Array<{ name: string; value: string; options?: any }>) {
            cookies.forEach((cookie) => {
              cookiesToSet.push(cookie)
            })
          },
        },
      }
    )
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message === 'Invalid login credentials' ? '邮箱或密码错误' : error.message },
        { status: 401 }
      )
    }

    // 创建响应并设置 cookies
    const response = NextResponse.json({ 
      success: true, 
      user: { 
        id: data.user.id, 
        email: data.user.email 
      } 
    })
    
    // 设置所有 cookie
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, {
        ...options,
        sameSite: 'lax',
        secure: true,
        path: '/',
      })
    })
    
    return response
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json({ error: '登录失败' }, { status: 500 })
  }
}

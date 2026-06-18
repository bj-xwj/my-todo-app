import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: Request) {
  try {
    const { email, password, name, department } = await request.json()
    
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
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          department,
          role: 'employee',
        }
      }
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // 创建用户资料
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        name,
        department,
        role: 'employee',
      })
    }

    // 创建响应并设置 cookies（自动登录）
    const response = NextResponse.json({ 
      success: true, 
      message: '注册成功'
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
    console.error('Register error:', e)
    return NextResponse.json({ error: '注册失败' }, { status: 500 })
  }
}

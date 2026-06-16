import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
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

    // 确保 cookie 被正确设置
    const response = NextResponse.json({ 
      success: true, 
      user: { 
        id: data.user.id, 
        email: data.user.email 
      } 
    })
    
    return response
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json({ error: '登录失败' }, { status: 500 })
  }
}

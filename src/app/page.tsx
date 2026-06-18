'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const redirectUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'admin') {
        window.location.href = '/admin'
      } else if (profile?.role === 'hr') {
        window.location.href = '/hr'
      } else {
        window.location.href = '/employee'
      }
    }

    redirectUser()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-gray-400">加载中...</div>
    </div>
  )
}

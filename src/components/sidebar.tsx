'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Clock, 
  FileText, 
  Calendar, 
  Users, 
  CheckSquare, 
  Settings,
  LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Sidebar({ profile }: { profile: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (path: string) => pathname.startsWith(path)

  const navItems = {
    employee: [
      { href: '/employee', label: '工作台', icon: LayoutDashboard },
      { href: '/employee/attendance', label: '打卡签到', icon: Clock },
      { href: '/employee/leave', label: '请假申请', icon: Calendar },
      { href: '/employee/overtime', label: '加班申请', icon: FileText },
      { href: '/employee/records', label: '考勤记录', icon: FileText },
    ],
    hr: [
      { href: '/hr', label: '工作台', icon: LayoutDashboard },
      { href: '/hr/approvals', label: '审批管理', icon: CheckSquare },
      { href: '/hr/employees', label: '员工管理', icon: Users },
      { href: '/hr/records', label: '考勤记录', icon: FileText },
      { href: '/hr/reports', label: '统计报表', icon: FileText },
    ],
    admin: [
      { href: '/admin', label: '工作台', icon: LayoutDashboard },
      { href: '/admin/users', label: '用户管理', icon: Users },
      { href: '/admin/settings', label: '系统设置', icon: Settings },
    ],
  }

  const items = navItems[profile.role as keyof typeof navItems] || navItems.employee

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">考勤管理系统</h1>
            <p className="text-xs text-gray-500">{profile.name}</p>
          </div>
        </div>
        <div className="mt-3 px-3 py-1 bg-primary-50 text-primary-700 text-xs rounded-full inline-block">
          {profile.role === 'admin' ? '管理员' : profile.role === 'hr' ? '人事' : '员工'}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                isActive(item.href)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition w-full"
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </button>
      </div>
    </aside>
  )
}

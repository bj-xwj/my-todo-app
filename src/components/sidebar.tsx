'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'
import {
  Home, Clock, FileText, Moon, BarChart3,
  CheckSquare, Users, Wrench, Settings, UserCog,
  LogOut, ClipboardList
} from 'lucide-react'

interface SidebarProps {
  profile: Profile
}

const employeeMenu = [
  { href: '/employee', label: '工作台', icon: Home },
  { href: '/employee/attendance', label: '打卡签到', icon: Clock },
  { href: '/employee/leave', label: '请假申请', icon: FileText },
  { href: '/employee/overtime', label: '加班申请', icon: Moon },
  { href: '/employee/records', label: '考勤记录', icon: BarChart3 },
]

const hrMenu = [
  { href: '/hr', label: '工作台', icon: Home },
  { href: '/hr/approvals', label: '审批管理', icon: CheckSquare },
  { href: '/hr/employees', label: '员工管理', icon: Users },
  { href: '/hr/corrections', label: '考勤修正', icon: Wrench },
  { href: '/hr/records', label: '考勤记录', icon: ClipboardList },
  { href: '/hr/reports', label: '统计报表', icon: BarChart3 },
]

const adminMenu = [
  { href: '/admin', label: '工作台', icon: Home },
  { href: '/admin/users', label: '用户管理', icon: UserCog },
  { href: '/admin/approvals', label: '审批管理', icon: CheckSquare },
  { href: '/admin/employees', label: '员工管理', icon: Users },
  { href: '/admin/corrections', label: '考勤修正', icon: Wrench },
  { href: '/admin/records', label: '考勤记录', icon: ClipboardList },
  { href: '/admin/reports', label: '统计报表', icon: BarChart3 },
  { href: '/admin/settings', label: '系统设置', icon: Settings },
]

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const menu = profile.role === 'admin' ? adminMenu : profile.role === 'hr' ? hrMenu : employeeMenu

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">考勤管理系统</h1>
            <p className="text-xs text-gray-400">Attendance System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all',
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className={cn('w-[18px] h-[18px]', isActive ? 'text-primary-600' : 'text-gray-400')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-medium text-sm">
              {profile.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{profile.name}</p>
            <p className="text-xs text-gray-400">{profile.employee_no}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-2 px-4 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </button>
      </div>
    </aside>
  )
}

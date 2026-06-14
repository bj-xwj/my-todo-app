import { createClient } from '@/lib/supabase/server'
import { getCurrentMonth } from '@/lib/utils'
import Link from 'next/link'

export default async function HRHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const monthStart = getCurrentMonth() + '-01'
  const monthEnd = getCurrentMonth() + '-31'

  const { count: pendingLeaves } = await supabase
    .from('leave_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: pendingOvertimes } = await supabase
    .from('overtime_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { data: abnormalRecords } = await supabase
    .from('attendance_records')
    .select('status')
    .gte('date', monthStart)
    .lte('date', monthEnd)
    .in('status', ['late', 'early', 'absent'])

  const abnormalCount = abnormalRecords?.length || 0

  const { count: employeeCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { data: recentLeaves } = await supabase
    .from('leave_requests')
    .select('*, profiles(name, employee_no)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentOvertimes } = await supabase
    .from('overtime_requests')
    .select('*, profiles(name, employee_no)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  const pendingTotal = (pendingLeaves || 0) + (pendingOvertimes || 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">人事工作台</h1>
        <p className="text-gray-500 mt-1">考勤审批与数据管理</p>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Link href="/hr/approvals" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-orange-200 hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待审批</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{pendingTotal}</p>
              <p className="text-xs text-gray-400 mt-1">请假 {pendingLeaves || 0} + 加班 {pendingOvertimes || 0}</p>
            </div>
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">本月异常考勤</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{abnormalCount}</p>
              <p className="text-xs text-gray-400 mt-1">迟到/早退/旷工</p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">员工总数</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{employeeCount || 0}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
          </div>
        </div>
        <Link href="/hr/reports" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-green-200 hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">统计报表</p>
              <p className="text-lg font-bold text-green-600 mt-2">查看 →</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
          </div>
        </Link>
      </div>

      {/* 待审批列表 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">待审批请假</h2>
            <Link href="/hr/approvals" className="text-sm text-primary-600 hover:text-primary-700">查看全部 →</Link>
          </div>
          {recentLeaves && recentLeaves.length > 0 ? (
            <div className="space-y-3">
              {recentLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-xs font-medium">
                      {(leave.profiles as any)?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{(leave.profiles as any)?.name}</p>
                      <p className="text-xs text-gray-500">{leave.leave_type} · {leave.days}天 · {leave.start_date}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">
                    待审批
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">暂无待审批 🎉</div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">待审批加班</h2>
            <Link href="/hr/approvals" className="text-sm text-primary-600 hover:text-primary-700">查看全部 →</Link>
          </div>
          {recentOvertimes && recentOvertimes.length > 0 ? (
            <div className="space-y-3">
              {recentOvertimes.map((ot) => (
                <div key={ot.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium">
                      {(ot.profiles as any)?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{(ot.profiles as any)?.name}</p>
                      <p className="text-xs text-gray-500">{ot.date} · {ot.hours}小时</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">
                    待审批
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">暂无待审批 🎉</div>
          )}
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
        <div className="grid grid-cols-5 gap-4">
          {[
            { href: '/hr/approvals', icon: '✅', label: '审批管理' },
            { href: '/hr/employees', icon: '👥', label: '员工管理' },
            { href: '/hr/corrections', icon: '🔧', label: '考勤修正' },
            { href: '/hr/records', icon: '📋', label: '考勤记录' },
            { href: '/hr/reports', icon: '📈', label: '统计报表' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm text-gray-700 font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

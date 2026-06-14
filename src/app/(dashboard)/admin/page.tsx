import { createClient } from '@/lib/supabase/server'
import { getCurrentMonth } from '@/lib/utils'

export default async function AdminHome() {
  const supabase = await createClient()

  const monthStart = getCurrentMonth() + '-01'
  const monthEnd = getCurrentMonth() + '-31'

  const { count: employeeCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: hrCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .in('role', ['hr', 'admin'])

  const { count: pendingLeaves } = await supabase
    .from('leave_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: pendingOvertimes } = await supabase
    .from('overtime_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: totalRecords } = await supabase
    .from('attendance_records')
    .select('*', { count: 'exact', head: true })

  const { count: monthRecords } = await supabase
    .from('attendance_records')
    .select('*', { count: 'exact', head: true })
    .gte('date', monthStart)
    .lte('date', monthEnd)

  const { count: corrections } = await supabase
    .from('attendance_corrections')
    .select('*', { count: 'exact', head: true })

  const { data: recentCorrections } = await supabase
    .from('attendance_corrections')
    .select('*, profiles(name, employee_no)')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentLeaves } = await supabase
    .from('leave_requests')
    .select('*, profiles(name, employee_no)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  const pendingTotal = (pendingLeaves || 0) + (pendingOvertimes || 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">管理员工作台</h1>
        <p className="text-gray-500 mt-1">系统全局管理与监控</p>
      </div>

      {/* 系统概览 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">员工总数</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{employeeCount || 0}</p>
              <p className="text-xs text-gray-400 mt-1">其中管理 {hrCount || 0} 人</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">本月考勤记录</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{monthRecords || 0}</p>
              <p className="text-xs text-gray-400 mt-1">累计 {totalRecords || 0} 条</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待审批事项</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{pendingTotal}</p>
              <p className="text-xs text-gray-400 mt-1">请假 {pendingLeaves || 0} + 加班 {pendingOvertimes || 0}</p>
            </div>
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">考勤修正</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{corrections || 0}</p>
              <p className="text-xs text-gray-400 mt-1">累计修正次数</p>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 待审批 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">待审批请假</h2>
            <a href="/admin/approvals" className="text-sm text-primary-600 hover:text-primary-700">处理全部 →</a>
          </div>
          {recentLeaves && recentLeaves.length > 0 ? (
            <div className="space-y-3">
              {recentLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{(leave.profiles as any)?.name}</p>
                    <p className="text-xs text-gray-500">{leave.leave_type} · {leave.days}天 · {leave.start_date}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">
                    待审批
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">暂无待审批事项 🎉</div>
          )}
        </div>

        {/* 最近修正 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">最近考勤修正</h2>
            <a href="/admin/corrections" className="text-sm text-primary-600 hover:text-primary-700">查看全部 →</a>
          </div>
          {recentCorrections && recentCorrections.length > 0 ? (
            <div className="space-y-3">
              {recentCorrections.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{(c.profiles as any)?.name}</p>
                    <p className="text-xs text-gray-500">{c.date} · {c.correction_type}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">暂无修正记录</div>
          )}
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { href: '/admin/users', icon: '👤', label: '用户管理', desc: '角色权限' },
            { href: '/admin/employees', icon: '👥', label: '员工管理', desc: '增删改查' },
            { href: '/admin/reports', icon: '📈', label: '统计报表', desc: '数据分析' },
            { href: '/admin/settings', icon: '⚙️', label: '系统设置', desc: '班次配置' },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
              <span className="text-xs text-gray-400">{item.desc}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

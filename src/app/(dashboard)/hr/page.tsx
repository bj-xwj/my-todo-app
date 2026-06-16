import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, Users, CheckSquare, FileText, TrendingUp } from 'lucide-react'

export default async function HRDashboard() {
  const supabase = await createClient()
  
  const today = new Date().toISOString().split('T')[0]
  const monthStart = `${today.substring(0, 7)}-01`

  const { data: pendingApprovals } = await supabase
    .from('leave_requests')
    .select('id', { count: 'exact' })
    .eq('status', 'pending')

  const { data: pendingOvertime } = await supabase
    .from('overtime_requests')
    .select('id', { count: 'exact' })
    .eq('status', 'pending')

  const { data: todayRecords } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('date', today)

  const { data: totalEmployees } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' })
    .eq('role', 'employee')

  const todayStats = {
    present: todayRecords?.filter(r => r.status === 'normal' || r.status === 'late').length || 0,
    absent: todayRecords?.filter(r => r.status === 'absent').length || 0,
    late: todayRecords?.filter(r => r.status === 'late').length || 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">工作台</h1>
        <p className="text-gray-500 mt-1">人事管理概览</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待审批请假</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pendingApprovals?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待审批加班</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pendingOvertime?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">今日出勤</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{todayStats.present}/{totalEmployees?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">今日迟到</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{todayStats.late} 人</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">今日考勤情况</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-green-700">正常出勤</span>
              <span className="text-lg font-bold text-green-700">{todayStats.present} 人</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm text-yellow-700">迟到</span>
              <span className="text-lg font-bold text-yellow-700">{todayStats.late} 人</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm text-red-700">旷工</span>
              <span className="text-lg font-bold text-red-700">{todayStats.absent} 人</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷入口</h2>
          <div className="grid grid-cols-2 gap-3">
            <a href="/hr/approvals" className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition">
              <CheckSquare className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">审批管理</span>
            </a>
            <a href="/hr/employees" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">员工管理</span>
            </a>
            <a href="/hr/records" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">考勤记录</span>
            </a>
            <a href="/hr/reports" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">统计报表</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

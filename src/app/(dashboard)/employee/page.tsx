import { createClient } from '@/lib/supabase/server'
import { getCurrentDate, getCurrentMonth, getStatusLabel, getStatusColor } from '@/lib/utils'
import Link from 'next/link'

export default async function EmployeeHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const today = getCurrentDate()
  const monthStart = getCurrentMonth() + '-01'
  const monthEnd = getCurrentMonth() + '-31'

  const { data: todayRecord } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  const { data: monthRecords } = await supabase
    .from('attendance_records')
    .select('status')
    .eq('user_id', user.id)
    .gte('date', monthStart)
    .lte('date', monthEnd)

  const stats = {
    normal: monthRecords?.filter(r => r.status === 'normal').length || 0,
    late: monthRecords?.filter(r => r.status === 'late').length || 0,
    early: monthRecords?.filter(r => r.status === 'early').length || 0,
    absent: monthRecords?.filter(r => r.status === 'absent').length || 0,
    leave: monthRecords?.filter(r => r.status === 'leave').length || 0,
  }

  const { data: pendingLeaves } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: recentRecords } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(5)

  const totalDays = stats.normal + stats.late + stats.early + stats.absent + stats.leave
  const attendanceRate = totalDays > 0 ? ((stats.normal / totalDays) * 100).toFixed(0) : '-'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">工作台</h1>
        <p className="text-gray-500 mt-1">
          欢迎回来，今天是 {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      {/* 今日打卡 + 出勤率 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">今日打卡</h2>
          {todayRecord ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <p className="text-sm text-gray-500">上班打卡</p>
                <p className="text-xl font-bold text-green-600 mt-1">
                  {todayRecord.clock_in
                    ? new Date(todayRecord.clock_in).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                    : '未打卡'}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-sm text-gray-500">下班打卡</p>
                <p className="text-xl font-bold text-blue-600 mt-1">
                  {todayRecord.clock_out
                    ? new Date(todayRecord.clock_out).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                    : '未打卡'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <p>今日尚未打卡</p>
              <Link href="/employee/attendance" className="inline-block mt-3 text-primary-600 hover:text-primary-700 font-medium text-sm">
                立即打卡 →
              </Link>
            </div>
          )}
        </div>
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-6 text-white flex flex-col items-center justify-center">
          <p className="text-sm text-white/70">本月出勤率</p>
          <p className="text-4xl font-bold mt-2">{attendanceRate}%</p>
          <p className="text-xs text-white/50 mt-2">共 {totalDays} 个工作日</p>
        </div>
      </div>

      {/* 本月统计 */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: '正常出勤', value: stats.normal, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
          { label: '迟到', value: stats.late, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
          { label: '早退', value: stats.early, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
          { label: '旷工', value: stats.absent, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
          { label: '休假', value: stats.leave, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl border p-4 text-center ${item.bg}`}>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 最近考勤记录 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">最近考勤</h2>
            <Link href="/employee/records" className="text-sm text-primary-600 hover:text-primary-700">查看全部 →</Link>
          </div>
          {recentRecords && recentRecords.length > 0 ? (
            <div className="space-y-3">
              {recentRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 w-24">{record.date}</span>
                    <span className="text-sm text-gray-500">
                      {record.clock_in ? new Date(record.clock_in).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      {' ~ '}
                      {record.clock_out ? new Date(record.clock_out).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                    {getStatusLabel(record.status)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">暂无考勤记录</p>
          )}
        </div>

        {/* 待审批请假 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">待审批请假</h2>
            <Link href="/employee/leave" className="text-sm text-primary-600 hover:text-primary-700">全部记录 →</Link>
          </div>
          {pendingLeaves && pendingLeaves.length > 0 ? (
            <div className="space-y-3">
              {pendingLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {leave.leave_type === 'personal' ? '事假' : leave.leave_type === 'sick' ? '病假' : leave.leave_type === 'annual' ? '年假' : leave.leave_type}
                    </p>
                    <p className="text-xs text-gray-500">{leave.start_date} ~ {leave.end_date} · {leave.days}天</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">
                    待审批
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">暂无待审批</p>
          )}
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
        <div className="grid grid-cols-4 gap-4">
          <Link href="/employee/attendance" className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-green-50 transition border border-transparent hover:border-green-200">
            <span className="text-2xl">⏰</span>
            <span className="text-sm text-gray-700 font-medium">打卡签到</span>
          </Link>
          <Link href="/employee/leave" className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-orange-50 transition border border-transparent hover:border-orange-200">
            <span className="text-2xl">📝</span>
            <span className="text-sm text-gray-700 font-medium">请假申请</span>
          </Link>
          <Link href="/employee/overtime" className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-blue-50 transition border border-transparent hover:border-blue-200">
            <span className="text-2xl">🌙</span>
            <span className="text-sm text-gray-700 font-medium">加班申请</span>
          </Link>
          <Link href="/employee/records" className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-purple-50 transition border border-transparent hover:border-purple-200">
            <span className="text-2xl">📊</span>
            <span className="text-sm text-gray-700 font-medium">考勤记录</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

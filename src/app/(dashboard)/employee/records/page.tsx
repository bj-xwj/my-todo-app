'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getStatusLabel, getStatusColor, formatDate, getCurrentMonth } from '@/lib/utils'

export default function RecordsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchRecords()
  }, [selectedMonth])

  const fetchRecords = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const monthStart = selectedMonth + '-01'
    const monthEnd = selectedMonth + '-31'

    const { data } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', monthStart)
      .lte('date', monthEnd)
      .order('date', { ascending: false })

    setRecords(data || [])
    setLoading(false)
  }

  // 月度统计
  const stats = {
    total: records.length,
    normal: records.filter(r => r.status === 'normal').length,
    late: records.filter(r => r.status === 'late').length,
    early: records.filter(r => r.status === 'early').length,
    absent: records.filter(r => r.status === 'absent').length,
    leave: records.filter(r => r.status === 'leave').length,
    overtime: records.filter(r => r.status === 'overtime').length,
    totalHours: records.reduce((sum, r) => sum + (r.work_hours || 0), 0).toFixed(1),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">考勤记录</h1>
          <p className="text-gray-500 mt-1">查看个人每日/月度考勤明细</p>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>

      {/* 月度统计 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">出勤天数</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.normal}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">迟到/早退</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.late + stats.early}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">请假天数</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.leave}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">总工时</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalHours}h</p>
        </div>
      </div>

      {/* 详细记录 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">每日明细</h2>
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">加载中...</p>
        ) : records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 font-medium text-gray-500">日期</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">上班打卡</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">下班打卡</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">工时</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">状态</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">备注</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium">{formatDate(record.date)}</td>
                    <td className="py-3 px-3 text-gray-600">
                      {record.clock_in 
                        ? new Date(record.clock_in).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                        : <span className="text-red-400">未打卡</span>}
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      {record.clock_out 
                        ? new Date(record.clock_out).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                        : <span className="text-red-400">未打卡</span>}
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      {record.work_hours ? `${record.work_hours}h` : '-'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusLabel(record.status)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-400 max-w-[150px] truncate">
                      {record.remark || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">本月暂无考勤记录</p>
        )}
      </div>
    </div>
  )
}

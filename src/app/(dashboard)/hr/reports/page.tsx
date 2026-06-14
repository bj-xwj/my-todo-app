'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentMonth } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface EmployeeStats {
  user_id: string
  name: string
  employee_no: string
  department: string | null
  normal_days: number
  late_days: number
  early_days: number
  absent_days: number
  leave_days: number
  overtime_hours: number
  total_records: number
}

const COLORS = ['#22c55e', '#f97316', '#eab308', '#ef4444', '#a855f7', '#3b82f6']

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [stats, setStats] = useState<EmployeeStats[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchReport()
  }, [selectedMonth])

  const fetchReport = async () => {
    setLoading(true)
    const monthStart = selectedMonth + '-01'
    const monthEnd = selectedMonth + '-31'

    const { data: employees } = await supabase
      .from('profiles')
      .select('id, name, employee_no, department')

    if (!employees) { setLoading(false); return }

    const { data: records } = await supabase
      .from('attendance_records')
      .select('user_id, status, work_hours')
      .gte('date', monthStart)
      .lte('date', monthEnd)

    const { data: overtimes } = await supabase
      .from('overtime_requests')
      .select('user_id, hours, status')
      .gte('date', monthStart)
      .lte('date', monthEnd)
      .eq('status', 'approved')

    const result: EmployeeStats[] = employees.map((emp) => {
      const empRecords = records?.filter(r => r.user_id === emp.id) || []
      const empOvertimes = overtimes?.filter(o => o.user_id === emp.id) || []
      return {
        user_id: emp.id,
        name: emp.name,
        employee_no: emp.employee_no,
        department: emp.department,
        normal_days: empRecords.filter(r => r.status === 'normal').length,
        late_days: empRecords.filter(r => r.status === 'late').length,
        early_days: empRecords.filter(r => r.status === 'early').length,
        absent_days: empRecords.filter(r => r.status === 'absent').length,
        leave_days: empRecords.filter(r => r.status === 'leave').length,
        overtime_hours: empOvertimes.reduce((sum, o) => sum + (o.hours || 0), 0),
        total_records: empRecords.length,
      }
    })

    setStats(result)
    setLoading(false)
  }

  const departments = Array.from(new Set(stats.map(s => s.department).filter(Boolean))) as string[]

  const filteredStats = stats.filter(emp => {
    const matchSearch = !searchText || emp.name.includes(searchText) || emp.employee_no.includes(searchText)
    const matchDept = !departmentFilter || emp.department === departmentFilter
    return matchSearch && matchDept
  })

  const summary = {
    totalEmployees: filteredStats.length,
    totalNormal: filteredStats.reduce((s, e) => s + e.normal_days, 0),
    totalLate: filteredStats.reduce((s, e) => s + e.late_days, 0),
    totalEarly: filteredStats.reduce((s, e) => s + e.early_days, 0),
    totalAbsent: filteredStats.reduce((s, e) => s + e.absent_days, 0),
    totalLeave: filteredStats.reduce((s, e) => s + e.leave_days, 0),
    totalOvertime: filteredStats.reduce((s, e) => s + e.overtime_hours, 0),
    attendanceRate: filteredStats.length > 0
      ? ((filteredStats.reduce((s, e) => s + e.normal_days, 0) / Math.max(filteredStats.reduce((s, e) => s + e.total_records, 0), 1)) * 100).toFixed(1)
      : '0',
  }

  const pieData = [
    { name: '正常出勤', value: summary.totalNormal },
    { name: '迟到', value: summary.totalLate },
    { name: '早退', value: summary.totalEarly },
    { name: '旷工', value: summary.totalAbsent },
    { name: '请假', value: summary.totalLeave },
  ].filter(d => d.value > 0)

  const barData = filteredStats.slice(0, 15).map(emp => ({
    name: emp.name.length > 4 ? emp.name.slice(0, 4) + '…' : emp.name,
    正常: emp.normal_days,
    迟到: emp.late_days,
    早退: emp.early_days,
    旷工: emp.absent_days,
    请假: emp.leave_days,
  }))

  const handleExportCSV = () => {
    const headers = ['工号', '姓名', '部门', '正常出勤', '迟到', '早退', '旷工', '请假', '加班(h)', '出勤率']
    const rows = filteredStats.map(emp => {
      const total = emp.normal_days + emp.late_days + emp.early_days + emp.absent_days + emp.leave_days
      const rate = total > 0 ? ((emp.normal_days / total) * 100).toFixed(1) + '%' : '-'
      return [emp.employee_no, emp.name, emp.department || '-', emp.normal_days, emp.late_days, emp.early_days, emp.absent_days, emp.leave_days, emp.overtime_hours, rate]
    })
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `考勤报表_${selectedMonth}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">统计报表</h1>
          <p className="text-gray-500 mt-1">月度考勤数据统计与分析</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            导出 CSV
          </button>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* 汇总卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">出勤率</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{summary.attendanceRate}%</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总加班时长</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{summary.totalOvertime}h</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">迟到 + 旷工</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{summary.totalLate + summary.totalAbsent}</p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">统计人数</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{summary.totalEmployees}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-3 gap-6">
        {/* 柱状图 */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">员工考勤分布</h2>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="正常" fill="#22c55e" radius={[2, 2, 0, 0]} />
                <Bar dataKey="迟到" fill="#f97316" radius={[2, 2, 0, 0]} />
                <Bar dataKey="早退" fill="#eab308" radius={[2, 2, 0, 0]} />
                <Bar dataKey="旷工" fill="#ef4444" radius={[2, 2, 0, 0]} />
                <Bar dataKey="请假" fill="#a855f7" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">暂无数据</div>
          )}
        </div>

        {/* 饼图 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">考勤状态占比</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">暂无数据</div>
          )}
        </div>
      </div>

      {/* 筛选 + 明细表格 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">员工月度考勤明细</h2>
          <div className="flex items-center gap-2">
            {departments.length > 0 && (
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">全部部门</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
            <input
              type="text"
              placeholder="搜索姓名/工号..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500 w-40"
            />
          </div>
        </div>
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">加载中...</p>
        ) : filteredStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 font-medium text-gray-500">工号</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">姓名</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">部门</th>
                  <th className="text-center py-3 px-3 font-medium text-gray-500">正常</th>
                  <th className="text-center py-3 px-3 font-medium text-gray-500">迟到</th>
                  <th className="text-center py-3 px-3 font-medium text-gray-500">早退</th>
                  <th className="text-center py-3 px-3 font-medium text-gray-500">旷工</th>
                  <th className="text-center py-3 px-3 font-medium text-gray-500">请假</th>
                  <th className="text-center py-3 px-3 font-medium text-gray-500">加班(h)</th>
                  <th className="text-center py-3 px-3 font-medium text-gray-500">出勤率</th>
                </tr>
              </thead>
              <tbody>
                {filteredStats.map((emp) => {
                  const total = emp.normal_days + emp.late_days + emp.early_days + emp.absent_days + emp.leave_days
                  const rate = total > 0 ? ((emp.normal_days / total) * 100).toFixed(0) : '-'
                  return (
                    <tr key={emp.user_id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-3 font-mono text-gray-600 text-xs">{emp.employee_no}</td>
                      <td className="py-3 px-3 font-medium text-gray-900">{emp.name}</td>
                      <td className="py-3 px-3 text-gray-500 text-xs">{emp.department || '-'}</td>
                      <td className="py-3 px-3 text-center text-green-600 font-medium">{emp.normal_days}</td>
                      <td className="py-3 px-3 text-center text-orange-600">{emp.late_days || '-'}</td>
                      <td className="py-3 px-3 text-center text-yellow-600">{emp.early_days || '-'}</td>
                      <td className="py-3 px-3 text-center text-red-600">{emp.absent_days || '-'}</td>
                      <td className="py-3 px-3 text-center text-purple-600">{emp.leave_days || '-'}</td>
                      <td className="py-3 px-3 text-center text-blue-600">{emp.overtime_hours || '-'}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-medium ${Number(rate) >= 90 ? 'text-green-600' : Number(rate) >= 70 ? 'text-orange-600' : 'text-red-600'}`}>
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">暂无数据</p>
        )}
      </div>
    </div>
  )
}

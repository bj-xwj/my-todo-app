'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getStatusLabel, getStatusColor, formatDate, getCurrentMonth } from '@/lib/utils'

export default function HRRecordsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [selectedMonth, selectedEmployee])

  const fetchEmployees = async () => {
    const { data } = await supabase.from('profiles').select('id, name, employee_no')
    setEmployees(data || [])
  }

  const fetchRecords = async () => {
    setLoading(true)
    let query = supabase
      .from('attendance_records')
      .select('*, profiles(name, employee_no)')
      .gte('date', selectedMonth + '-01')
      .lte('date', selectedMonth + '-31')
      .order('date', { ascending: false })

    if (selectedEmployee) {
      query = query.eq('user_id', selectedEmployee)
    }

    const { data } = await query
    setRecords(data || [])
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">考勤记录</h1>
        <p className="text-gray-500 mt-1">查看全部员工考勤记录</p>
      </div>

      {/* 筛选 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
        <div>
          <label className="text-sm text-gray-500 mr-2">月份:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500 mr-2">员工:</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">全部员工</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name} ({emp.employee_no})</option>
            ))}
          </select>
        </div>
        <div className="ml-auto text-sm text-gray-500">
          共 {records.length} 条记录
        </div>
      </div>

      {/* 记录列表 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">加载中...</p>
        ) : records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 font-medium text-gray-500">员工</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">日期</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">上班打卡</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">下班打卡</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">工时</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">状态</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <span className="font-medium text-gray-900">{(record.profiles as any)?.name}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{formatDate(record.date)}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">暂无考勤记录</p>
        )}
      </div>
    </div>
  )
}

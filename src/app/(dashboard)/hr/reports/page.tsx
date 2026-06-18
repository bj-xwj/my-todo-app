'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { TrendingUp, Users, Calendar } from 'lucide-react'

const COLORS = {
  normal: '#22c55e',
  late: '#eab308',
  absent: '#ef4444',
  overtime: '#3b82f6',
  leave: '#a855f7',
}

// 动态导入 recharts 避免 SSR 问题
function DynamicCharts({ pieData, barData }: { pieData: any[]; barData: any[] }) {
  const [ChartComponents, setChartComponents] = useState<any>(null)

  useEffect(() => {
    import('recharts').then((mod) => {
      setChartComponents(mod)
    })
  }, [])

  if (!ChartComponents) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-400">
        加载图表中...
      </div>
    )
  }

  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } = ChartComponents

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">考勤状态分布</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {pieData.map((item: any) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">考勤统计</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}

export default function ReportsPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function load() {
      const today = new Date().toISOString().split('T')[0]
      const monthStart = `${today.substring(0, 7)}-01`

      const { data: monthlyRecords } = await supabase
        .from('attendance_records')
        .select('status')
        .gte('date', monthStart)

      const { data: employees } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'employee')

      const statusStats = {
        normal: monthlyRecords?.filter((r: any) => r.status === 'normal').length || 0,
        late: monthlyRecords?.filter((r: any) => r.status === 'late').length || 0,
        absent: monthlyRecords?.filter((r: any) => r.status === 'absent').length || 0,
        overtime: monthlyRecords?.filter((r: any) => r.status === 'overtime').length || 0,
        leave: monthlyRecords?.filter((r: any) => r.status === 'leave').length || 0,
      }

      const pieData = [
        { name: '正常', value: statusStats.normal, color: COLORS.normal },
        { name: '迟到', value: statusStats.late, color: COLORS.late },
        { name: '旷工', value: statusStats.absent, color: COLORS.absent },
        { name: '加班', value: statusStats.overtime, color: COLORS.overtime },
        { name: '请假', value: statusStats.leave, color: COLORS.leave },
      ].filter((d: any) => d.value > 0)

      const barData = [
        { name: '正常', count: statusStats.normal },
        { name: '迟到', count: statusStats.late },
        { name: '旷工', count: statusStats.absent },
        { name: '加班', count: statusStats.overtime },
        { name: '请假', count: statusStats.leave },
      ]

      setData({ monthlyRecords, employees, pieData, barData, statusStats })
    }

    load()
  }, [])

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">统计报表</h1>
          <p className="text-gray-500 mt-1">本月考勤数据统计</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    )
  }

  const { monthlyRecords, employees, pieData, barData, statusStats } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">统计报表</h1>
        <p className="text-gray-500 mt-1">本月考勤数据统计</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总出勤人次</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {monthlyRecords?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">员工总数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{employees?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">正常出勤率</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {monthlyRecords?.length
                  ? Math.round((statusStats.normal / monthlyRecords.length) * 100)
                  : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DynamicCharts pieData={pieData} barData={barData} />
      </div>
    </div>
  )
}

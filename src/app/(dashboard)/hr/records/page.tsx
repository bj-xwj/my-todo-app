import { createClient } from '@/lib/supabase/server'
import { FileText } from 'lucide-react'

export default async function HRRecordsPage() {
  const supabase = await createClient()
  
  const today = new Date().toISOString().split('T')[0]

  const { data: records } = await supabase
    .from('attendance_records')
    .select('*, profiles(name)')
    .eq('date', today)
    .order('check_in', { ascending: false })

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-50 text-green-700'
      case 'late': return 'bg-yellow-50 text-yellow-700'
      case 'early_leave': return 'bg-orange-50 text-orange-700'
      case 'absent': return 'bg-red-50 text-red-700'
      case 'overtime': return 'bg-blue-50 text-blue-700'
      case 'leave': return 'bg-purple-50 text-purple-700'
      default: return 'bg-gray-50 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return '正常'
      case 'late': return '迟到'
      case 'early_leave': return '早退'
      case 'absent': return '旷工'
      case 'overtime': return '加班'
      case 'leave': return '请假'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">考勤记录</h1>
        <p className="text-gray-500 mt-1">查看今日所有员工考勤记录</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">今日考勤 · {today}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">员工</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">部门</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">上班时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">下班时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!records || records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>今日暂无考勤记录</p>
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {record.profiles?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{record.profiles?.name || '未知'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{record.profiles?.department || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{record.check_in || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{record.check_out || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

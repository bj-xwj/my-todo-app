import { createClient } from '@/lib/supabase/server'
import { Clock, Calendar, FileText, TrendingUp } from 'lucide-react'

export default async function EmployeeDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const today = new Date().toISOString().split('T')[0]
  
  const { data: todayRecord } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('user_id', user?.id)
    .eq('date', today)
    .single()

  const { data: monthlyStats } = await supabase
    .from('attendance_records')
    .select('status')
    .eq('user_id', user?.id)
    .gte('date', `${today.substring(0, 7)}-01`)

  const stats = {
    present: monthlyStats?.filter(r => r.status === 'normal').length || 0,
    late: monthlyStats?.filter(r => r.status === 'late').length || 0,
    absent: monthlyStats?.filter(r => r.status === 'absent').length || 0,
    overtime: monthlyStats?.filter(r => r.status === 'overtime').length || 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">工作台</h1>
        <p className="text-gray-500 mt-1">欢迎回来，今天也要元气满满！</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">本月出勤</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.present} 天</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">迟到次数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.late} 次</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">旷工次数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.absent} 次</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">加班天数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.overtime} 天</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">今日打卡</h2>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
            todayRecord?.check_in 
              ? 'bg-green-50 text-green-700' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            上班: {todayRecord?.check_in || '未打卡'}
          </div>
          <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
            todayRecord?.check_out 
              ? 'bg-green-50 text-green-700' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            下班: {todayRecord?.check_out || '未打卡'}
          </div>
        </div>
      </div>
    </div>
  )
}

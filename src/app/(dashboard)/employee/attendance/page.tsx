'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, MapPin } from 'lucide-react'

export default function AttendancePage() {
  const [loading, setLoading] = useState(false)
  const [todayRecord, setTodayRecord] = useState<any>(null)
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchTodayRecord()
  }, [])

  const fetchTodayRecord = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { data } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()
    
    setTodayRecord(data)
  }

  const handleCheckIn = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const now = new Date()
    const time = now.toTimeString().substring(0, 5)
    const hour = now.getHours()
    const minute = now.getMinutes()
    
    // 9:00 后算迟到
    const isLate = hour > 9 || (hour === 9 && minute > 0)

    if (todayRecord) {
      await supabase
        .from('attendance_records')
        .update({ check_in: time, status: isLate ? 'late' : 'normal' })
        .eq('id', todayRecord.id)
    } else {
      await supabase
        .from('attendance_records')
        .insert({
          user_id: user.id,
          date: today,
          check_in: time,
          status: isLate ? 'late' : 'normal',
        })
    }

    await fetchTodayRecord()
    setLoading(false)
  }

  const handleCheckOut = async () => {
    setLoading(true)
    if (!todayRecord) return

    const now = new Date()
    const time = now.toTimeString().substring(0, 5)
    const hour = now.getHours()
    
    // 18:00 前算早退
    const isEarly = hour < 18
    let status = todayRecord.status
    
    if (isEarly && status === 'normal') status = 'early_leave'

    await supabase
      .from('attendance_records')
      .update({ check_out: time, status })
      .eq('id', todayRecord.id)

    await fetchTodayRecord()
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">打卡签到</h1>
        <p className="text-gray-500 mt-1">{today} · 工作日</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-12 h-12 text-primary-600" />
          </div>
          
          <div>
            <p className="text-3xl font-bold text-gray-900">
              {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-gray-500 mt-1">
              上班时间 09:00 · 下班时间 18:00
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>定位中...</span>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleCheckIn}
              disabled={loading || todayRecord?.check_in}
              className="px-8 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-xl font-medium text-lg transition"
            >
              {todayRecord?.check_in ? `已打卡 ${todayRecord.check_in}` : '上班打卡'}
            </button>
            
            <button
              onClick={handleCheckOut}
              disabled={loading || !todayRecord?.check_in || todayRecord?.check_out}
              className="px-8 py-4 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white rounded-xl font-medium text-lg transition"
            >
              {todayRecord?.check_out ? `已打卡 ${todayRecord.check_out}` : '下班打卡'}
            </button>
          </div>

          {todayRecord?.status && (
            <div className={`inline-flex px-4 py-2 rounded-lg text-sm font-medium ${
              todayRecord.status === 'normal' ? 'bg-green-50 text-green-700' :
              todayRecord.status === 'late' ? 'bg-yellow-50 text-yellow-700' :
              todayRecord.status === 'early_leave' ? 'bg-orange-50 text-orange-700' :
              'bg-gray-50 text-gray-700'
            }`}>
              今日状态: {
                todayRecord.status === 'normal' ? '正常' :
                todayRecord.status === 'late' ? '迟到' :
                todayRecord.status === 'early_leave' ? '早退' :
                todayRecord.status === 'overtime' ? '加班' :
                todayRecord.status === 'leave' ? '请假' : '旷工'
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentDate } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { Clock, Sun, Moon, AlertCircle } from 'lucide-react'

export default function AttendancePage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [todayRecord, setTodayRecord] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [shiftConfig, setShiftConfig] = useState<any>(null)
  const supabase = createClient()
  const { showToast } = useToast()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchTodayRecord()
    fetchShiftConfig()
  }, [])

  const fetchShiftConfig = async () => {
    const { data } = await supabase
      .from('shift_config')
      .select('*')
      .eq('is_active', true)
      .single()
    setShiftConfig(data)
  }

  const fetchTodayRecord = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', getCurrentDate())
      .single()

    setTodayRecord(data)
  }

  const handleClockIn = async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const now = new Date()
    const today = getCurrentDate()

    const { data: existing } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    if (existing?.clock_in) {
      showToast('今天已经打过上班卡了', 'warning')
      setLoading(false)
      return
    }

    if (existing) {
      const { error } = await supabase
        .from('attendance_records')
        .update({ clock_in: now.toISOString() })
        .eq('id', existing.id)

      if (error) {
        showToast('打卡失败: ' + error.message, 'error')
      } else {
        showToast('上班打卡成功！', 'success')
        fetchTodayRecord()
      }
    } else {
      const { error } = await supabase
        .from('attendance_records')
        .insert({
          user_id: user.id,
          date: today,
          clock_in: now.toISOString(),
          status: 'normal',
        })

      if (error) {
        showToast('打卡失败: ' + error.message, 'error')
      } else {
        showToast('上班打卡成功！', 'success')
        fetchTodayRecord()
      }
    }

    setLoading(false)
  }

  const handleClockOut = async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const now = new Date()
    const today = getCurrentDate()

    const { data: existing } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    if (!existing) {
      showToast('请先打上班卡', 'warning')
      setLoading(false)
      return
    }

    if (existing.clock_out) {
      showToast('今天已经打下班卡了', 'warning')
      setLoading(false)
      return
    }

    const clockIn = new Date(existing.clock_in)
    const workHours = ((now.getTime() - clockIn.getTime()) / (1000 * 60 * 60)).toFixed(2)

    const { error } = await supabase
      .from('attendance_records')
      .update({
        clock_out: now.toISOString(),
        work_hours: parseFloat(workHours),
      })
      .eq('id', existing.id)

    if (error) {
      showToast('打卡失败: ' + error.message, 'error')
    } else {
      showToast(`下班打卡成功！今日工作 ${workHours} 小时`, 'success')
      fetchTodayRecord()
    }

    setLoading(false)
  }

  const clockInTime = shiftConfig?.clock_in_time?.substring(0, 5) || '09:00'
  const clockOutTime = shiftConfig?.clock_out_time?.substring(0, 5) || '18:00'
  const lateThreshold = shiftConfig?.late_threshold_minutes || 15
  const earlyThreshold = shiftConfig?.early_threshold_minutes || 15

  // 计算当前工时
  const currentWorkHours = todayRecord?.clock_in && !todayRecord?.clock_out
    ? ((currentTime.getTime() - new Date(todayRecord.clock_in).getTime()) / (1000 * 60 * 60)).toFixed(1)
    : todayRecord?.work_hours?.toFixed(1) || null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">打卡签到</h1>
        <p className="text-gray-500 mt-1">上下班打卡，请确保准时打卡</p>
      </div>

      {/* 时间显示 */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-8 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgY3g9IjMwIiBjeT0iMzAiIHI9IjIwIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="relative">
          <p className="text-5xl font-mono font-bold tracking-wider">
            {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-white/70 mt-3 text-sm">
            {currentTime.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
          {currentWorkHours && (
            <p className="text-white/60 mt-2 text-xs">当前工时: {currentWorkHours} 小时</p>
          )}
        </div>
      </div>

      {/* 打卡按钮 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sun className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">上班打卡</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {todayRecord?.clock_in
              ? `已打卡: ${new Date(todayRecord.clock_in).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
              : '尚未打卡'}
          </p>
          <button
            onClick={handleClockIn}
            disabled={loading || !!todayRecord?.clock_in}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-3.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            {todayRecord?.clock_in ? '已打卡' : '上班打卡'}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Moon className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">下班打卡</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {todayRecord?.clock_out
              ? `已打卡: ${new Date(todayRecord.clock_out).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
              : todayRecord?.clock_in
                ? '可以打下班卡了'
                : '请先打上班卡'}
          </p>
          <button
            onClick={handleClockOut}
            disabled={loading || !todayRecord?.clock_in || !!todayRecord?.clock_out}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-3.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            {todayRecord?.clock_out ? '已打卡' : '下班打卡'}
          </button>
        </div>
      </div>

      {/* 打卡规则 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">打卡规则</h3>
          {shiftConfig && (
            <span className="ml-auto text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">
              {shiftConfig.name}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">上班时间</p>
            <p className="text-lg font-semibold text-gray-900 mt-0.5">{clockInTime}</p>
            <p className="text-xs text-gray-400 mt-0.5">超过 {clockInTime} 后 {lateThreshold} 分钟视为迟到</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">下班时间</p>
            <p className="text-lg font-semibold text-gray-900 mt-0.5">{clockOutTime}</p>
            <p className="text-xs text-gray-400 mt-0.5">早于 {clockOutTime} 前 {earlyThreshold} 分钟视为早退</p>
          </div>
        </div>
        <ul className="space-y-2 text-sm text-gray-600 mt-4">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
            未打卡且无请假记录视为旷工
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
            每日需打两次卡（上班 + 下班）
          </li>
        </ul>
      </div>
    </div>
  )
}

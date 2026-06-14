'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const [shift, setShift] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '标准班次',
    clock_in_time: '09:00',
    clock_out_time: '18:00',
    late_threshold_minutes: 15,
    early_threshold_minutes: 15,
  })
  const supabase = createClient()

  useEffect(() => {
    fetchShiftConfig()
  }, [])

  const fetchShiftConfig = async () => {
    const { data } = await supabase
      .from('shift_config')
      .select('*')
      .eq('is_active', true)
      .single()

    if (data) {
      setShift(data)
      setFormData({
        name: data.name,
        clock_in_time: data.clock_in_time?.substring(0, 5) || '09:00',
        clock_out_time: data.clock_out_time?.substring(0, 5) || '18:00',
        late_threshold_minutes: data.late_threshold_minutes,
        early_threshold_minutes: data.early_threshold_minutes,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (shift) {
      const { error } = await supabase
        .from('shift_config')
        .update({
          name: formData.name,
          clock_in_time: formData.clock_in_time + ':00',
          clock_out_time: formData.clock_out_time + ':00',
          late_threshold_minutes: formData.late_threshold_minutes,
          early_threshold_minutes: formData.early_threshold_minutes,
        })
        .eq('id', shift.id)

      if (error) {
        setMessage('保存失败: ' + error.message)
      } else {
        setMessage('保存成功！')
      }
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <p className="text-gray-500 mt-1">配置考勤规则和班次</p>
      </div>

      {/* 班次设置 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">班次配置</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">班次名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full max-w-md px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">上班时间</label>
              <input
                type="time"
                value={formData.clock_in_time}
                onChange={(e) => setFormData({ ...formData, clock_in_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">下班时间</label>
              <input
                type="time"
                value={formData.clock_out_time}
                onChange={(e) => setFormData({ ...formData, clock_out_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">迟到阈值(分钟)</label>
              <input
                type="number"
                value={formData.late_threshold_minutes}
                onChange={(e) => setFormData({ ...formData, late_threshold_minutes: parseInt(e.target.value) })}
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-400 mt-1">超过上班时间多少分钟算迟到</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">早退阈值(分钟)</label>
              <input
                type="number"
                value={formData.early_threshold_minutes}
                onChange={(e) => setFormData({ ...formData, early_threshold_minutes: parseInt(e.target.value) })}
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-400 mt-1">早于下班时间多少分钟算早退</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-2 px-6 rounded-lg transition text-sm"
          >
            {loading ? '保存中...' : '保存设置'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${message.includes('失败') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}
      </div>

      {/* 系统信息 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">系统信息</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-500 w-24">系统版本</span>
            <span className="text-gray-900">v1.0.0</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 w-24">框架</span>
            <span className="text-gray-900">Next.js 14 + Supabase</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 w-24">部署平台</span>
            <span className="text-gray-900">Vercel</span>
          </div>
        </div>
      </div>
    </div>
  )
}

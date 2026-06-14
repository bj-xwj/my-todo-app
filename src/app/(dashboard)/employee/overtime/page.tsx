'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getStatusLabel, getStatusColor, formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { Moon, Clock, FileText } from 'lucide-react'

export default function OvertimePage() {
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    hours: 0,
    reason: '',
  })
  const [loading, setLoading] = useState(false)
  const [overtimes, setOvertimes] = useState<any[]>([])
  const supabase = createClient()
  const { showToast } = useToast()

  useEffect(() => {
    fetchOvertimes()
  }, [])

  const fetchOvertimes = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('overtime_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setOvertimes(data || [])
  }

  const calculateHours = (start: string, end: string) => {
    if (!start || !end) return 0
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    const diff = (eh * 60 + em - sh * 60 - sm) / 60
    return Math.max(Math.round(diff * 10) / 10, 0)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'start_time' || name === 'end_time') {
        updated.hours = calculateHours(
          name === 'start_time' ? value : prev.start_time,
          name === 'end_time' ? value : prev.end_time
        )
      }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    if (formData.hours <= 0) {
      showToast('加班时长必须大于0', 'error')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('overtime_requests')
      .insert({
        user_id: user.id,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        hours: formData.hours,
        reason: formData.reason,
        status: 'pending',
      })

    if (error) {
      showToast('提交失败: ' + error.message, 'error')
    } else {
      showToast('加班申请已提交，等待审批', 'success')
      setFormData({ date: '', start_time: '', end_time: '', hours: 0, reason: '' })
      fetchOvertimes()
    }

    setLoading(false)
  }

  const stats = {
    total: overtimes.length,
    pending: overtimes.filter(o => o.status === 'pending').length,
    approved: overtimes.filter(o => o.status === 'approved').length,
    totalHours: overtimes.filter(o => o.status === 'approved').reduce((s, o) => s + o.hours, 0),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">加班申请</h1>
        <p className="text-gray-500 mt-1">提交加班申请，等待人事审批</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">总申请</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-gray-500 mt-1">待审批</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          <p className="text-xs text-gray-500 mt-1">已通过</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.totalHours}h</p>
          <p className="text-xs text-gray-500 mt-1">累计加班</p>
        </div>
      </div>

      {/* 申请表单 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Moon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">新建加班申请</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">加班日期</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">加班时长</label>
              <input
                type="number"
                name="hours"
                value={formData.hours}
                onChange={handleChange}
                min="0.5"
                step="0.5"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm bg-gray-50"
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">加班原因</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm resize-none"
              placeholder="请说明加班原因和工作内容"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-2.5 px-6 rounded-lg transition text-sm"
          >
            {loading ? '提交中...' : '提交申请'}
          </button>
        </form>
      </div>

      {/* 申请记录 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">我的加班记录</h2>
        </div>
        {overtimes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">日期</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">时间段</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">时长</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">原因</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">状态</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">审批意见</th>
                </tr>
              </thead>
              <tbody>
                {overtimes.map((ot) => (
                  <tr key={ot.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2">{formatDate(ot.date)}</td>
                    <td className="py-3 px-2 text-gray-600">{ot.start_time} ~ {ot.end_time}</td>
                    <td className="py-3 px-2 font-medium">{ot.hours}h</td>
                    <td className="py-3 px-2 text-gray-600 max-w-[200px] truncate">{ot.reason}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ot.status)}`}>
                        {getStatusLabel(ot.status)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-500 max-w-[150px] truncate text-xs">
                      {ot.review_remark || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">暂无加班记录</p>
        )}
      </div>
    </div>
  )
}

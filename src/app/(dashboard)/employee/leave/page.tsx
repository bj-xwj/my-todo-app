'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getStatusLabel, getStatusColor, getLeaveTypeLabel, formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { CalendarDays, FileText, Clock } from 'lucide-react'

export default function LeavePage() {
  const [formData, setFormData] = useState({
    leave_type: 'personal',
    start_date: '',
    end_date: '',
    days: 1,
    reason: '',
  })
  const [loading, setLoading] = useState(false)
  const [leaves, setLeaves] = useState<any[]>([])
  const supabase = createClient()
  const { showToast } = useToast()

  useEffect(() => {
    fetchLeaves()
  }, [])

  const fetchLeaves = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setLeaves(data || [])
  }

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 1
    const s = new Date(start)
    const e = new Date(end)
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return Math.max(diff, 1)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'start_date' || name === 'end_date') {
        updated.days = calculateDays(
          name === 'start_date' ? value : prev.start_date,
          name === 'end_date' ? value : prev.end_date
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

    if (formData.end_date < formData.start_date) {
      showToast('结束日期不能早于开始日期', 'error')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('leave_requests')
      .insert({
        user_id: user.id,
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        days: formData.days,
        reason: formData.reason,
        status: 'pending',
      })

    if (error) {
      showToast('提交失败: ' + error.message, 'error')
    } else {
      showToast('请假申请已提交，等待审批', 'success')
      setFormData({ leave_type: 'personal', start_date: '', end_date: '', days: 1, reason: '' })
      fetchLeaves()
    }

    setLoading(false)
  }

  // 统计
  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
    totalDays: leaves.filter(l => l.status === 'approved').reduce((s, l) => s + l.days, 0),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">请假申请</h1>
        <p className="text-gray-500 mt-1">提交请假申请，等待人事审批</p>
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
          <p className="text-2xl font-bold text-purple-600">{stats.totalDays}天</p>
          <p className="text-xs text-gray-500 mt-1">已休天数</p>
        </div>
      </div>

      {/* 申请表单 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">新建请假申请</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">请假类型</label>
              <select
                name="leave_type"
                value={formData.leave_type}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
              >
                <option value="personal">事假</option>
                <option value="sick">病假</option>
                <option value="annual">年假</option>
                <option value="marriage">婚假</option>
                <option value="maternity">产假</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">请假天数</label>
              <input
                type="number"
                name="days"
                value={formData.days}
                onChange={handleChange}
                min="0.5"
                step="0.5"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">请假原因</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm resize-none"
              placeholder="请详细说明请假原因"
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
          <h2 className="text-lg font-semibold text-gray-900">我的请假记录</h2>
        </div>
        {leaves.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">类型</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">日期</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">天数</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">原因</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">状态</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">审批意见</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {getLeaveTypeLabel(leave.leave_type)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-600 text-xs">{formatDate(leave.start_date)} ~ {formatDate(leave.end_date)}</td>
                    <td className="py-3 px-2 font-medium">{leave.days}天</td>
                    <td className="py-3 px-2 text-gray-600 max-w-[200px] truncate">{leave.reason}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                        {getStatusLabel(leave.status)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-500 max-w-[150px] truncate text-xs">
                      {leave.review_remark || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">暂无请假记录</p>
        )}
      </div>
    </div>
  )
}

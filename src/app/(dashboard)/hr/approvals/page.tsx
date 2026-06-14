'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getStatusLabel, getStatusColor, getLeaveTypeLabel, formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { CheckSquare, Check, X, Clock, MessageSquare } from 'lucide-react'

export default function ApprovalsPage() {
  const [tab, setTab] = useState<'leave' | 'overtime'>('leave')
  const [leaves, setLeaves] = useState<any[]>([])
  const [overtimes, setOvertimes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [reviewRemark, setReviewRemark] = useState<Record<string, string>>({})
  const [statusFilter, setStatusFilter] = useState<string>('')
  const supabase = createClient()
  const { showToast } = useToast()

  useEffect(() => {
    fetchData()
  }, [tab])

  const fetchData = async () => {
    setLoading(true)
    if (tab === 'leave') {
      const { data } = await supabase
        .from('leave_requests')
        .select('*, profiles(name, employee_no, department)')
        .order('created_at', { ascending: false })
      setLeaves(data || [])
    } else {
      const { data } = await supabase
        .from('overtime_requests')
        .select('*, profiles(name, employee_no, department)')
        .order('created_at', { ascending: false })
      setOvertimes(data || [])
    }
    setLoading(false)
  }

  const handleReview = async (id: string, status: 'approved' | 'rejected', type: 'leave' | 'overtime') => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const remark = reviewRemark[id] || ''

    if (type === 'leave') {
      await supabase
        .from('leave_requests')
        .update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString(), review_remark: remark })
        .eq('id', id)
    } else {
      await supabase
        .from('overtime_requests')
        .update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString(), review_remark: remark })
        .eq('id', id)
    }

    showToast(status === 'approved' ? '已通过审批' : '已拒绝', status === 'approved' ? 'success' : 'warning')
    fetchData()
  }

  const handleBatchApprove = async (ids: string[], type: 'leave' | 'overtime') => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const table = type === 'leave' ? 'leave_requests' : 'overtime_requests'

    for (const id of ids) {
      await supabase
        .from(table)
        .update({ status: 'approved', reviewed_by: user.id, reviewed_at: new Date().toISOString() })
        .eq('id', id)
    }

    showToast(`已批量通过 ${ids.length} 项`, 'success')
    fetchData()
  }

  const pendingLeaveIds = leaves.filter(l => l.status === 'pending').map(l => l.id)
  const pendingOvertimeIds = overtimes.filter(o => o.status === 'pending').map(o => o.id)

  const currentList = tab === 'leave' ? leaves : overtimes
  const filteredList = statusFilter ? currentList.filter(item => item.status === statusFilter) : currentList

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">审批管理</h1>
          <p className="text-gray-500 mt-1">审核员工请假和加班申请</p>
        </div>
        {tab === 'leave' && pendingLeaveIds.length > 1 && (
          <button
            onClick={() => handleBatchApprove(pendingLeaveIds, 'leave')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            全部通过 ({pendingLeaveIds.length})
          </button>
        )}
        {tab === 'overtime' && pendingOvertimeIds.length > 1 && (
          <button
            onClick={() => handleBatchApprove(pendingOvertimeIds, 'overtime')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            全部通过 ({pendingOvertimeIds.length})
          </button>
        )}
      </div>

      {/* Tab + 筛选 */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-100 px-6">
          <div className="flex">
            <button
              onClick={() => setTab('leave')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                tab === 'leave'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              请假审批
            </button>
            <button
              onClick={() => setTab('overtime')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                tab === 'overtime'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              加班审批
            </button>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {['', 'pending', 'approved', 'rejected'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  statusFilter === s
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s === '' ? '全部' : getStatusLabel(s)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-8">加载中...</p>
          ) : filteredList.length > 0 ? (
            <div className="space-y-4">
              {filteredList.map((item) => (
                <div key={item.id} className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-medium">
                          {(item.profiles as any)?.name?.charAt(0)}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{(item.profiles as any)?.name}</span>
                          <span className="text-xs text-gray-400 ml-2">{(item.profiles as any)?.employee_no}</span>
                          {(item.profiles as any)?.department && (
                            <span className="text-xs text-gray-400 ml-2">· {(item.profiles as any)?.department}</span>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </div>

                      {tab === 'leave' ? (
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                          <div>类型: {getLeaveTypeLabel(item.leave_type)}</div>
                          <div>日期: {formatDate(item.start_date)} ~ {formatDate(item.end_date)}</div>
                          <div>天数: {item.days}天</div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                          <div>日期: {formatDate(item.date)}</div>
                          <div>时间: {item.start_time} ~ {item.end_time}</div>
                          <div>时长: {item.hours}小时</div>
                        </div>
                      )}

                      <p className="text-sm text-gray-500">原因: {item.reason}</p>
                      {item.review_remark && (
                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> 审批意见: {item.review_remark}
                        </p>
                      )}
                    </div>

                    {item.status === 'pending' && (
                      <div className="flex items-center gap-2 ml-4">
                        <input
                          type="text"
                          placeholder="审批意见"
                          value={reviewRemark[item.id] || ''}
                          onChange={(e) => setReviewRemark({ ...reviewRemark, [item.id]: e.target.value })}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm w-32 outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <button
                          onClick={() => handleReview(item.id, 'approved', tab)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> 通过
                        </button>
                        <button
                          onClick={() => handleReview(item.id, 'rejected', tab)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> 拒绝
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">
              {statusFilter ? '没有匹配的记录' : tab === 'leave' ? '暂无请假申请' : '暂无加班申请'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

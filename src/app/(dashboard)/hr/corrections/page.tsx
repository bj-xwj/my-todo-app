'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getStatusLabel, getStatusColor, formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { Plus, Wrench, Search } from 'lucide-react'

export default function CorrectionsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [formData, setFormData] = useState({
    user_id: '',
    date: '',
    correction_type: 'status',
    corrected_status: 'normal',
    clock_in_time: '',
    clock_out_time: '',
    reason: '',
  })
  const [employees, setEmployees] = useState<any[]>([])
  const supabase = createClient()
  const { showToast } = useToast()

  useEffect(() => {
    fetchCorrections()
    fetchEmployees()
  }, [])

  const fetchCorrections = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('attendance_corrections')
      .select('*, profiles(name, employee_no)')
      .order('created_at', { ascending: false })
    setRecords(data || [])
    setLoading(false)
  }

  const fetchEmployees = async () => {
    const { data } = await supabase.from('profiles').select('id, name, employee_no')
    setEmployees(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: existing } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', formData.user_id)
      .eq('date', formData.date)
      .single()

    let recordId = existing?.id
    const originalStatus = existing?.status || 'absent'

    if (formData.correction_type === 'add_record' && !existing) {
      const { data: newRecord } = await supabase
        .from('attendance_records')
        .insert({
          user_id: formData.user_id,
          date: formData.date,
          status: formData.corrected_status,
          clock_in: formData.clock_in_time ? `${formData.date}T${formData.clock_in_time}:00` : null,
          clock_out: formData.clock_out_time ? `${formData.date}T${formData.clock_out_time}:00` : null,
        })
        .select()
        .single()
      recordId = newRecord?.id
    } else if (existing) {
      const updateData: any = { status: formData.corrected_status }
      if (formData.correction_type === 'clock_in' && formData.clock_in_time) {
        updateData.clock_in = `${formData.date}T${formData.clock_in_time}:00`
      }
      if (formData.correction_type === 'clock_out' && formData.clock_out_time) {
        updateData.clock_out = `${formData.date}T${formData.clock_out_time}:00`
      }
      await supabase.from('attendance_records').update(updateData).eq('id', existing.id)
    }

    await supabase.from('attendance_corrections').insert({
      record_id: recordId,
      user_id: formData.user_id,
      date: formData.date,
      original_status: originalStatus,
      corrected_status: formData.corrected_status,
      correction_type: formData.correction_type,
      reason: formData.reason,
      corrected_by: user.id,
    })

    showToast('考勤修正已保存', 'success')
    setShowModal(false)
    setFormData({ user_id: '', date: '', correction_type: 'status', corrected_status: 'normal', clock_in_time: '', clock_out_time: '', reason: '' })
    fetchCorrections()
  }

  const filteredRecords = records.filter(r => {
    if (!searchText) return true
    const name = (r.profiles as any)?.name || ''
    const empNo = (r.profiles as any)?.employee_no || ''
    return name.includes(searchText) || empNo.includes(searchText) || r.date.includes(searchText)
  })

  const correctionTypeLabels: Record<string, string> = {
    clock_in: '上班打卡',
    clock_out: '下班打卡',
    status: '状态修正',
    add_record: '补录记录',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">考勤修正</h1>
          <p className="text-gray-500 mt-1">补录和修正异常考勤数据（共 {records.length} 条记录）</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition text-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          新增修正
        </button>
      </div>

      {/* 搜索 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索姓名、工号、日期..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">加载中...</p>
        ) : filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 font-medium text-gray-500">员工</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">日期</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">修正类型</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">原状态</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">修正后</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">原因</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">操作时间</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-medium">
                          {(record.profiles as any)?.name?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{(record.profiles as any)?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{formatDate(record.date)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                        {correctionTypeLabels[record.correction_type] || record.correction_type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.original_status || '')}`}>
                        {getStatusLabel(record.original_status || '')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.corrected_status || '')}`}>
                        {getStatusLabel(record.corrected_status || '')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-500 max-w-[200px] truncate text-xs">{record.reason}</td>
                    <td className="py-3 px-3 text-gray-400 text-xs">
                      {new Date(record.created_at).toLocaleString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">
            {searchText ? '没有匹配的记录' : '暂无修正记录'}
          </p>
        )}
      </div>

      {/* 修正模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">新增考勤修正</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择员工</label>
                <select
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
                  required
                >
                  <option value="">请选择员工</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.employee_no})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">修正类型</label>
                  <select
                    value={formData.correction_type}
                    onChange={(e) => setFormData({ ...formData, correction_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="status">状态修正</option>
                    <option value="clock_in">补录上班打卡</option>
                    <option value="clock_out">补录下班打卡</option>
                    <option value="add_record">补录整条记录</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">修正后状态</label>
                  <select
                    value={formData.corrected_status}
                    onChange={(e) => setFormData({ ...formData, corrected_status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="normal">正常</option>
                    <option value="late">迟到</option>
                    <option value="early">早退</option>
                    <option value="leave">休假</option>
                    <option value="absent">旷工</option>
                  </select>
                </div>
              </div>

              {(formData.correction_type === 'clock_in' || formData.correction_type === 'add_record') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">上班打卡时间</label>
                  <input
                    type="time"
                    value={formData.clock_in_time}
                    onChange={(e) => setFormData({ ...formData, clock_in_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              )}

              {(formData.correction_type === 'clock_out' || formData.correction_type === 'add_record') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">下班打卡时间</label>
                  <input
                    type="time"
                    value={formData.clock_out_time}
                    onChange={(e) => setFormData({ ...formData, clock_out_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">修正原因</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                  placeholder="请说明修正原因"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">取消</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition">确认修正</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

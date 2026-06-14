'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getRoleLabel } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editEmployee, setEditEmployee] = useState<any>(null)
  const [searchText, setSearchText] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    employee_no: '',
    email: '',
    department: '',
    phone: '',
    role: 'employee',
  })
  const supabase = createClient()
  const { showToast } = useToast()

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setEmployees(data || [])
    setLoading(false)
  }

  const openCreateModal = () => {
    setEditEmployee(null)
    setFormData({ name: '', employee_no: '', email: '', department: '', phone: '', role: 'employee' })
    setShowModal(true)
  }

  const openEditModal = (emp: any) => {
    setEditEmployee(emp)
    setFormData({
      name: emp.name,
      employee_no: emp.employee_no,
      email: emp.email || '',
      department: emp.department || '',
      phone: emp.phone || '',
      role: emp.role,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editEmployee) {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          employee_no: formData.employee_no,
          department: formData.department,
          phone: formData.phone,
          role: formData.role,
        })
        .eq('id', editEmployee.id)

      if (error) {
        showToast('更新失败: ' + error.message, 'error')
      } else {
        showToast('员工信息已更新', 'success')
      }
    } else {
      const password = '123456'
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password,
        options: {
          data: {
            name: formData.name,
            employee_no: formData.employee_no,
            department: formData.department,
            phone: formData.phone,
            role: formData.role,
          },
        },
      })

      if (authError) {
        showToast('创建失败: ' + authError.message, 'error')
        return
      }
      showToast('员工创建成功！默认密码: 123456', 'success')
    }

    setShowModal(false)
    fetchEmployees()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) {
      showToast('删除失败: ' + error.message, 'error')
    } else {
      showToast('员工已删除', 'success')
    }

    setConfirmDelete(null)
    fetchEmployees()
  }

  const filteredEmployees = employees.filter(emp => {
    const matchSearch = !searchText || emp.name.includes(searchText) || emp.employee_no.includes(searchText) || (emp.email || '').includes(searchText)
    const matchRole = !roleFilter || emp.role === roleFilter
    return matchSearch && matchRole
  })

  const roleCounts = {
    all: employees.length,
    employee: employees.filter(e => e.role === 'employee').length,
    hr: employees.filter(e => e.role === 'hr').length,
    admin: employees.filter(e => e.role === 'admin').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">员工管理</h1>
          <p className="text-gray-500 mt-1">管理企业员工信息（共 {employees.length} 人）</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition text-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          添加员工
        </button>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索姓名、工号、邮箱..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          {[
            { key: '', label: '全部', count: roleCounts.all },
            { key: 'employee', label: '员工', count: roleCounts.employee },
            { key: 'hr', label: '人事', count: roleCounts.hr },
            { key: 'admin', label: '管理员', count: roleCounts.admin },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setRoleFilter(item.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                roleFilter === item.key
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {item.label} ({item.count})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">加载中...</p>
        ) : filteredEmployees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 font-medium text-gray-500">工号</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">姓名</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">邮箱</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">部门</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">角色</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">手机号</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 font-mono text-gray-600 text-xs">{emp.employee_no}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-medium">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-600 text-xs">{emp.email || '-'}</td>
                    <td className="py-3 px-3 text-gray-600 text-xs">{emp.department || '-'}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        emp.role === 'admin' ? 'bg-red-50 text-red-600' :
                        emp.role === 'hr' ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {getRoleLabel(emp.role)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 text-xs">{emp.phone || '-'}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          title="编辑"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {confirmDelete === emp.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(emp.id)}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                            >
                              确认
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(emp.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="删除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">
            {searchText || roleFilter ? '没有匹配的员工' : '暂无员工数据'}
          </p>
        )}
      </div>

      {/* 模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editEmployee ? '编辑员工' : '添加员工'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">工号 *</label>
                  <input
                    type="text"
                    value={formData.employee_no}
                    onChange={(e) => setFormData({ ...formData, employee_no: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              {!editEmployee && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">部门</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="employee">普通员工</option>
                  <option value="hr">人事</option>
                  <option value="admin">超级管理员</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition"
                >
                  {editEmployee ? '保存修改' : '创建员工'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

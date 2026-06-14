'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getRoleLabel } from '@/lib/utils'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
    fetchUsers()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <p className="text-gray-500 mt-1">管理系统用户角色与权限</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>权限说明：</strong>
            普通员工只能查看自己的考勤数据和提交申请；
            人事可以审批申请、管理员工信息和考勤数据；
            超级管理员拥有所有权限，包括系统设置。
          </p>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">加载中...</p>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 font-medium text-gray-500">工号</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">姓名</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">邮箱</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">部门</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">当前角色</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">修改角色</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">注册时间</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 font-mono text-gray-600">{user.employee_no}</td>
                    <td className="py-3 px-3 font-medium text-gray-900">{user.name}</td>
                    <td className="py-3 px-3 text-gray-600">{user.email || '-'}</td>
                    <td className="py-3 px-3 text-gray-600">{user.department || '-'}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-red-50 text-red-600' :
                        user.role === 'hr' ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="px-2 py-1 border border-gray-200 rounded text-xs outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="employee">普通员工</option>
                        <option value="hr">人事</option>
                        <option value="admin">超级管理员</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-gray-400 text-xs">
                      {new Date(user.created_at).toLocaleDateString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">暂无用户数据</p>
        )}
      </div>
    </div>
  )
}

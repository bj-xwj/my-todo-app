import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, Users, Settings, Shield } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const stats = {
    total: users?.length || 0,
    employees: users?.filter(u => u.role === 'employee').length || 0,
    hr: users?.filter(u => u.role === 'hr').length || 0,
    admin: users?.filter(u => u.role === 'admin').length || 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">管理员工作台</h1>
        <p className="text-gray-500 mt-1">系统管理和用户配置</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总用户数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">员工</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.employees}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">人事</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.hr}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">管理员</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.admin}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷入口</h2>
          <div className="space-y-3">
            <a href="/admin/users" className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition">
              <Users className="w-5 h-5 text-primary-600" />
              <div>
                <span className="text-sm font-medium text-primary-700 block">用户管理</span>
                <span className="text-xs text-primary-500">管理系统用户和权限</span>
              </div>
            </a>
            <a href="/admin/settings" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
              <Settings className="w-5 h-5 text-gray-600" />
              <div>
                <span className="text-sm font-medium text-gray-700 block">系统设置</span>
                <span className="text-xs text-gray-500">配置考勤规则和参数</span>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">最近注册用户</h2>
          <div className="space-y-3">
            {users?.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {user.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  user.role === 'admin' ? 'bg-purple-50 text-purple-700' :
                  user.role === 'hr' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-green-50 text-green-700'
                }`}>
                  {user.role === 'admin' ? '管理员' : user.role === 'hr' ? '人事' : '员工'}
                </span>
              </div>
            )) || (
              <p className="text-center text-gray-500 py-4">暂无用户</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

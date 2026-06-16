import { Settings, Clock, MapPin, Calendar } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <p className="text-gray-500 mt-1">配置考勤规则和系统参数</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">考勤时间设置</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">上班时间</p>
                <p className="text-xs text-gray-500">标准上班打卡时间</p>
              </div>
              <span className="text-sm font-medium text-primary-600">09:00</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">下班时间</p>
                <p className="text-xs text-gray-500">标准下班打卡时间</p>
              </div>
              <span className="text-sm font-medium text-primary-600">18:00</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">迟到阈值</p>
                <p className="text-xs text-gray-500">超过此时间算迟到</p>
              </div>
              <span className="text-sm font-medium text-yellow-600">09:00 后</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">早退阈值</p>
                <p className="text-xs text-gray-500">早于此时间算早退</p>
              </div>
              <span className="text-sm font-medium text-orange-600">18:00 前</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">打卡规则</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">打卡方式</p>
                <p className="text-xs text-gray-500">当前支持的打卡方式</p>
              </div>
              <span className="text-sm font-medium text-green-600">在线打卡</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">定位要求</p>
                <p className="text-xs text-gray-500">是否需要定位验证</p>
              </div>
              <span className="text-sm font-medium text-gray-600">可选</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">补卡规则</p>
                <p className="text-xs text-gray-500">是否允许补打卡</p>
              </div>
              <span className="text-sm font-medium text-green-600">允许</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">假期设置</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">年假天数</p>
                <p className="text-xs text-gray-500">每年可用年假</p>
              </div>
              <span className="text-sm font-medium text-primary-600">5 天</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">病假天数</p>
                <p className="text-xs text-gray-500">每年可用病假</p>
              </div>
              <span className="text-sm font-medium text-primary-600">10 天</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">事假天数</p>
                <p className="text-xs text-gray-500">每年可用事假</p>
              </div>
              <span className="text-sm font-medium text-primary-600">3 天</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">系统信息</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">系统版本</p>
                <p className="text-xs text-gray-500">当前运行版本</p>
              </div>
              <span className="text-sm font-medium text-gray-600">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">技术栈</p>
                <p className="text-xs text-gray-500">系统架构</p>
              </div>
              <span className="text-sm font-medium text-gray-600">Next.js + Supabase</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">部署平台</p>
                <p className="text-xs text-gray-500">当前运行环境</p>
              </div>
              <span className="text-sm font-medium text-gray-600">Vercel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

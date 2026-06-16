import { createClient } from '@/lib/supabase/server'
import { CheckCircle, XCircle, Clock, CheckSquare } from 'lucide-react'

export default async function ApprovalsPage() {
  const supabase = await createClient()

  const { data: leaveRequests } = await supabase
    .from('leave_requests')
    .select('*, profiles(name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const { data: overtimeRequests } = await supabase
    .from('overtime_requests')
    .select('*, profiles(name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">审批管理</h1>
        <p className="text-gray-500 mt-1">审核员工请假和加班申请</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">请假申请 ({leaveRequests?.length || 0})</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {!leaveRequests || leaveRequests.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>暂无待审批的请假申请</p>
            </div>
          ) : (
            leaveRequests.map((req) => (
              <div key={req.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{req.profiles?.name || '未知'}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {req.type === 'sick' ? '病假' : req.type === 'personal' ? '事假' : req.type === 'annual' ? '年假' : '其他'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {req.start_date} 至 {req.end_date}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">{req.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={`/api/approvals/leave/${req.id}/approve`} method="POST">
                    <button type="submit" className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition">
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </form>
                  <form action={`/api/approvals/leave/${req.id}/reject`} method="POST">
                    <button type="submit" className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-orange-600" />
          <h2 className="text-lg font-semibold text-gray-900">加班申请 ({overtimeRequests?.length || 0})</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {!overtimeRequests || overtimeRequests.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>暂无待审批的加班申请</p>
            </div>
          ) : (
            overtimeRequests.map((req) => (
              <div key={req.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{req.profiles?.name || '未知'}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                      {req.hours} 小时
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {req.date} · {req.start_time} - {req.end_time}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">{req.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={`/api/approvals/overtime/${req.id}/approve`} method="POST">
                    <button type="submit" className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition">
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </form>
                  <form action={`/api/approvals/overtime/${req.id}/reject`} method="POST">
                    <button type="submit" className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

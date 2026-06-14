import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    normal: '正常',
    late: '迟到',
    early: '早退',
    absent: '旷工',
    overtime: '加班',
    leave: '休假',
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝',
  }
  return map[status] || status
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    normal: 'text-green-600 bg-green-50',
    late: 'text-orange-600 bg-orange-50',
    early: 'text-yellow-600 bg-yellow-50',
    absent: 'text-red-600 bg-red-50',
    overtime: 'text-blue-600 bg-blue-50',
    leave: 'text-purple-600 bg-purple-50',
    pending: 'text-yellow-600 bg-yellow-50',
    approved: 'text-green-600 bg-green-50',
    rejected: 'text-red-600 bg-red-50',
  }
  return map[status] || 'text-gray-600 bg-gray-50'
}

export function getLeaveTypeLabel(type: string): string {
  const map: Record<string, string> = {
    personal: '事假',
    sick: '病假',
    annual: '年假',
    marriage: '婚假',
    maternity: '产假',
    other: '其他',
  }
  return map[type] || type
}

export function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    employee: '普通员工',
    hr: '人事',
    admin: '超级管理员',
  }
  return map[role] || role
}

export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0]
}

export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

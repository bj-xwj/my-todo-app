export interface User {
  id: string
  email: string
  role: 'employee' | 'hr' | 'admin'
  name: string
  department?: string
  created_at?: string
}

export interface AttendanceRecord {
  id: string
  user_id: string
  date: string
  check_in?: string
  check_out?: string
  status: 'normal' | 'late' | 'early_leave' | 'absent' | 'overtime' | 'leave'
  location?: string
  notes?: string
  created_at?: string
}

export interface LeaveRequest {
  id: string
  user_id: string
  user_name?: string
  type: 'sick' | 'personal' | 'annual' | 'other'
  start_date: string
  end_date: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  approved_by?: string
  approved_at?: string
  created_at?: string
}

export interface OvertimeRequest {
  id: string
  user_id: string
  user_name?: string
  date: string
  start_time: string
  end_time: string
  hours: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  approved_by?: string
  approved_at?: string
  created_at?: string
}

export interface MonthlyReport {
  user_id: string
  user_name: string
  month: string
  total_days: number
  present_days: number
  late_count: number
  early_leave_count: number
  absent_count: number
  overtime_hours: number
  leave_days: number
}

export type UserRole = 'employee' | 'hr' | 'admin'

export interface Profile {
  id: string
  employee_no: string
  name: string
  email: string | null
  role: UserRole
  department: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type AttendanceStatus = 'normal' | 'late' | 'early' | 'absent' | 'overtime' | 'leave'

export interface AttendanceRecord {
  id: string
  user_id: string
  date: string
  clock_in: string | null
  clock_out: string | null
  status: AttendanceStatus
  work_hours: number | null
  remark: string | null
  created_at: string
  updated_at: string
  profiles?: Profile
}

export type LeaveType = 'personal' | 'sick' | 'annual' | 'marriage' | 'maternity' | 'other'
export type RequestStatus = 'pending' | 'approved' | 'rejected'

export interface LeaveRequest {
  id: string
  user_id: string
  leave_type: LeaveType
  start_date: string
  end_date: string
  days: number
  reason: string
  status: RequestStatus
  reviewed_by: string | null
  reviewed_at: string | null
  review_remark: string | null
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface OvertimeRequest {
  id: string
  user_id: string
  date: string
  start_time: string
  end_time: string
  hours: number
  reason: string
  status: RequestStatus
  reviewed_by: string | null
  reviewed_at: string | null
  review_remark: string | null
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface AttendanceCorrection {
  id: string
  record_id: string | null
  user_id: string
  date: string
  original_status: string | null
  corrected_status: string | null
  correction_type: 'clock_in' | 'clock_out' | 'status' | 'add_record'
  reason: string
  corrected_by: string
  created_at: string
}

export interface ShiftConfig {
  id: string
  name: string
  clock_in_time: string
  clock_out_time: string
  late_threshold_minutes: number
  early_threshold_minutes: number
  is_active: boolean
}

export interface MonthlyStats {
  user_id: string
  month: string
  normal_days: number
  late_days: number
  early_days: number
  absent_days: number
  leave_days: number
  overtime_hours: number
  total_work_days: number
}

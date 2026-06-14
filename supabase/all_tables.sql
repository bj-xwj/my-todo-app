-- ============================================
-- 员工考勤管理系统 - 6 张表完整建表脚本
-- ============================================
-- 数据库：PostgreSQL / Supabase
-- 执行顺序：按表依赖关系排列，直接全量执行即可
-- ============================================


-- ============================================
-- 表 1：用户资料表 (profiles)
-- 说明：扩展 auth.users，存储员工基本信息与角色
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  employee_no VARCHAR(20) UNIQUE NOT NULL,          -- 工号
  name VARCHAR(50) NOT NULL,                        -- 姓名
  email VARCHAR(255),                                  -- 邮箱（注册时自动同步）
  role VARCHAR(20) NOT NULL DEFAULT 'employee'      -- 角色：employee/hr/admin
    CHECK (role IN ('employee', 'hr', 'admin')),
  department VARCHAR(50),                            -- 部门
  phone VARCHAR(20),                                 -- 手机号
  avatar_url TEXT,                                   -- 头像地址
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- 表 2：考勤记录表 (attendance_records)
-- 说明：每日打卡记录，自动判定考勤状态
-- ============================================
CREATE TABLE public.attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,                                -- 考勤日期
  clock_in TIMESTAMPTZ,                              -- 上班打卡时间
  clock_out TIMESTAMPTZ,                             -- 下班打卡时间
  status VARCHAR(20) NOT NULL DEFAULT 'normal'       -- 状态
    CHECK (status IN ('normal', 'late', 'early', 'absent', 'overtime', 'leave')),
  work_hours DECIMAL(4,2),                           -- 工时（小时）
  remark TEXT,                                       -- 备注
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)                              -- 每人每天唯一
);


-- ============================================
-- 表 3：请假申请表 (leave_requests)
-- 说明：员工请假申请，支持多级审批
-- ============================================
CREATE TABLE public.leave_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  leave_type VARCHAR(20) NOT NULL                    -- 假别
    CHECK (leave_type IN ('personal', 'sick', 'annual', 'marriage', 'maternity', 'other')),
  start_date DATE NOT NULL,                          -- 开始日期
  end_date DATE NOT NULL,                            -- 结束日期
  days DECIMAL(4,1) NOT NULL,                        -- 请假天数
  reason TEXT NOT NULL,                              -- 请假原因
  status VARCHAR(20) NOT NULL DEFAULT 'pending'      -- 审批状态
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),   -- 审批人
  reviewed_at TIMESTAMPTZ,                           -- 审批时间
  review_remark TEXT,                                -- 审批意见
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- 表 4：加班申请表 (overtime_requests)
-- 说明：员工加班申请，支持多级审批
-- ============================================
CREATE TABLE public.overtime_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,                                -- 加班日期
  start_time TIME NOT NULL,                          -- 开始时间
  end_time TIME NOT NULL,                            -- 结束时间
  hours DECIMAL(4,1) NOT NULL,                       -- 加班时长（小时）
  reason TEXT NOT NULL,                              -- 加班原因
  status VARCHAR(20) NOT NULL DEFAULT 'pending'      -- 审批状态
    CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),   -- 审批人
  reviewed_at TIMESTAMPTZ,                           -- 审批时间
  review_remark TEXT,                                -- 审批意见
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- 表 5：考勤修正记录表 (attendance_corrections)
-- 说明：HR/管理员对考勤记录的手动修正日志
-- ============================================
CREATE TABLE public.attendance_corrections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID REFERENCES public.attendance_records(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,                                -- 修正日期
  original_status VARCHAR(20),                       -- 原始状态
  corrected_status VARCHAR(20),                      -- 修正后状态
  correction_type VARCHAR(30) NOT NULL               -- 修正类型
    CHECK (correction_type IN ('clock_in', 'clock_out', 'status', 'add_record')),
  reason TEXT NOT NULL,                              -- 修正原因
  corrected_by UUID REFERENCES public.profiles(id) NOT NULL, -- 操作人
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- 表 6：班次配置表 (shift_config)
-- 说明：考勤班次设置（上下班时间、迟到/早退阈值）
-- ============================================
CREATE TABLE public.shift_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL DEFAULT '标准班次',      -- 班次名称
  clock_in_time TIME NOT NULL DEFAULT '09:00:00',    -- 上班时间
  clock_out_time TIME NOT NULL DEFAULT '18:00:00',   -- 下班时间
  late_threshold_minutes INT NOT NULL DEFAULT 15,    -- 迟到阈值（分钟）
  early_threshold_minutes INT NOT NULL DEFAULT 15,   -- 早退阈值（分钟）
  is_active BOOLEAN DEFAULT true,                    -- 是否启用
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- 默认数据：插入标准班次
-- ============================================
INSERT INTO public.shift_config (name, clock_in_time, clock_out_time, late_threshold_minutes, early_threshold_minutes)
VALUES ('标准班次', '09:00:00', '18:00:00', 15, 15);


-- ============================================
-- 索引
-- ============================================
CREATE INDEX idx_attendance_user_date ON public.attendance_records(user_id, date);
CREATE INDEX idx_attendance_date ON public.attendance_records(date);
CREATE INDEX idx_leave_user_status ON public.leave_requests(user_id, status);
CREATE INDEX idx_overtime_user_status ON public.overtime_requests(user_id, status);
CREATE INDEX idx_corrections_user ON public.attendance_corrections(user_id);

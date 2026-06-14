-- ============================================
-- 员工考勤管理系统 - Supabase 数据库初始化脚本
-- ============================================

-- 1. 用户资料表 (扩展 auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  employee_no VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(255) REFERENCES auth.users(email),
  role VARCHAR(20) NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'hr', 'admin')),
  department VARCHAR(50),
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 考勤记录表
CREATE TABLE public.attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'late', 'early', 'absent', 'overtime', 'leave')),
  work_hours DECIMAL(4,2),
  remark TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 3. 请假申请表
CREATE TABLE public.leave_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('personal', 'sick', 'annual', 'marriage', 'maternity', 'other')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days DECIMAL(4,1) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_remark TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 加班申请表
CREATE TABLE public.overtime_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  hours DECIMAL(4,1) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_remark TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 考勤修正记录表
CREATE TABLE public.attendance_corrections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID REFERENCES public.attendance_records(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  original_status VARCHAR(20),
  corrected_status VARCHAR(20),
  correction_type VARCHAR(30) NOT NULL CHECK (correction_type IN ('clock_in', 'clock_out', 'status', 'add_record')),
  reason TEXT NOT NULL,
  corrected_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 班次配置表
CREATE TABLE public.shift_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL DEFAULT '标准班次',
  clock_in_time TIME NOT NULL DEFAULT '09:00:00',
  clock_out_time TIME NOT NULL DEFAULT '18:00:00',
  late_threshold_minutes INT NOT NULL DEFAULT 15,
  early_threshold_minutes INT NOT NULL DEFAULT 15,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入默认班次配置
INSERT INTO public.shift_config (name, clock_in_time, clock_out_time, late_threshold_minutes, early_threshold_minutes)
VALUES ('标准班次', '09:00:00', '18:00:00', 15, 15);

-- 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_config ENABLE ROW LEVEL SECURITY;

-- ============ RLS 策略 ============

-- profiles: 所有人可读自己的，HR和Admin可读全部
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_hr_admin" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('hr', 'admin'))
);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_update_hr_admin" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('hr', 'admin'))
);

-- attendance_records: 员工看自己的，HR/Admin看全部
CREATE POLICY "attendance_select_own" ON public.attendance_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "attendance_select_hr_admin" ON public.attendance_records FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('hr', 'admin'))
);
CREATE POLICY "attendance_insert_own" ON public.attendance_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "attendance_update_own" ON public.attendance_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "attendance_update_hr_admin" ON public.attendance_records FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('hr', 'admin'))
);

-- leave_requests: 员工看自己的，HR/Admin看全部
CREATE POLICY "leave_select_own" ON public.leave_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "leave_select_hr_admin" ON public.leave_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('hr', 'admin'))
);
CREATE POLICY "leave_insert_own" ON public.leave_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "leave_update_own" ON public.leave_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "leave_update_hr_admin" ON public.leave_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('hr', 'admin'))
);

-- overtime_requests: 员工看自己的，HR/Admin看全部
CREATE POLICY "overtime_select_own" ON public.overtime_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "overtime_select_hr_admin" ON public.overtime_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('hr', 'admin'))
);
CREATE POLICY "overtime_insert_own" ON public.overtime_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "overtime_update_own" ON public.overtime_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "overtime_update_hr_admin" ON public.overtime_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('hr', 'admin'))
);

-- attendance_corrections: HR/Admin 可操作
CREATE POLICY "corrections_select_own" ON public.attendance_corrections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "corrections_select_hr_admin" ON public.attendance_corrections FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('hr', 'admin'))
);
CREATE POLICY "corrections_insert_hr_admin" ON public.attendance_corrections FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('hr', 'admin'))
);

-- shift_config: 所有人可读，仅Admin可写
CREATE POLICY "shift_select_all" ON public.shift_config FOR SELECT USING (true);
CREATE POLICY "shift_update_admin" ON public.shift_config FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============ 触发器：自动创建 profile ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, employee_no, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'employee_no', 'EMP' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0')),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ 函数：自动判定考勤状态 ============
CREATE OR REPLACE FUNCTION public.evaluate_attendance_status(p_user_id UUID, p_date DATE)
RETURNS VOID AS $$
DECLARE
  v_record RECORD;
  v_shift RECORD;
  v_status VARCHAR(20);
  v_clock_in_time TIME;
  v_clock_out_time TIME;
  v_late_threshold INT;
  v_early_threshold INT;
  v_has_leave BOOLEAN;
  v_has_overtime BOOLEAN;
BEGIN
  -- 获取班次配置
  SELECT * INTO v_shift FROM public.shift_config WHERE is_active = true LIMIT 1;
  IF v_shift IS NULL THEN
    v_shift.clock_in_time := '09:00:00';
    v_shift.clock_out_time := '18:00:00';
    v_shift.late_threshold_minutes := 15;
    v_shift.early_threshold_minutes := 15;
  END IF;

  -- 获取考勤记录
  SELECT * INTO v_record FROM public.attendance_records 
  WHERE user_id = p_user_id AND date = p_date;

  IF v_record IS NULL THEN RETURN; END IF;

  -- 检查是否有请假
  SELECT EXISTS(
    SELECT 1 FROM public.leave_requests 
    WHERE user_id = p_user_id AND status = 'approved' 
    AND p_date BETWEEN start_date AND end_date
  ) INTO v_has_leave;

  -- 检查是否有加班
  SELECT EXISTS(
    SELECT 1 FROM public.overtime_requests 
    WHERE user_id = p_user_id AND status = 'approved' AND date = p_date
  ) INTO v_has_overtime;

  -- 判定状态
  IF v_has_leave THEN
    v_status := 'leave';
  ELSIF v_record.clock_in IS NULL AND v_record.clock_out IS NULL THEN
    v_status := 'absent';
  ELSE
    v_clock_in_time := CASE WHEN v_record.clock_in IS NOT NULL 
      THEN v_record.clock_in::TIME ELSE NULL END;
    v_clock_out_time := CASE WHEN v_record.clock_out IS NOT NULL 
      THEN v_record.clock_out::TIME ELSE NULL END;

    IF v_clock_in_time IS NOT NULL AND v_clock_in_time > (v_shift.clock_in_time + (v_shift.late_threshold_minutes || ' minutes')::INTERVAL)::TIME THEN
      v_status := 'late';
    ELSIF v_clock_out_time IS NOT NULL AND v_clock_out_time < (v_shift.clock_out_time - (v_shift.early_threshold_minutes || ' minutes')::INTERVAL)::TIME THEN
      v_status := 'early';
    ELSIF v_has_overtime THEN
      v_status := 'overtime';
    ELSE
      v_status := 'normal';
    END IF;
  END IF;

  -- 更新状态
  UPDATE public.attendance_records 
  SET status = v_status, updated_at = NOW()
  WHERE id = v_record.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============ 索引 ============
CREATE INDEX idx_attendance_user_date ON public.attendance_records(user_id, date);
CREATE INDEX idx_attendance_date ON public.attendance_records(date);
CREATE INDEX idx_leave_user_status ON public.leave_requests(user_id, status);
CREATE INDEX idx_overtime_user_status ON public.overtime_requests(user_id, status);
CREATE INDEX idx_corrections_user ON public.attendance_corrections(user_id);

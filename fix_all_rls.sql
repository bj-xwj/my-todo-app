-- ============================================
-- 修复所有业务表的 RLS 策略（避免递归，表名正确）
-- ============================================

-- 1. attendance_records
DROP POLICY IF EXISTS "attendance_select_own" ON public.attendance_records;
DROP POLICY IF EXISTS "attendance_select_approver" ON public.attendance_records;
DROP POLICY IF EXISTS "attendance_insert_any" ON public.attendance_records;
DROP POLICY IF EXISTS "attendance_update_admin" ON public.attendance_records;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance_select_own" ON public.attendance_records FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "attendance_select_approver" ON public.attendance_records FOR SELECT USING ((auth.jwt()->'user_metadata'->>'role')::text IN ('admin', 'manager'));
CREATE POLICY "attendance_insert_own" ON public.attendance_records FOR INSERT WITH CHECK (employee_id = auth.uid());
CREATE POLICY "attendance_update_admin" ON public.attendance_records FOR UPDATE USING ((auth.jwt()->'user_metadata'->>'role')::text = 'admin') WITH CHECK (true);

-- 2. leave_requests
DROP POLICY IF EXISTS "leave_select_own" ON public.leave_requests;
DROP POLICY IF EXISTS "leave_select_approver" ON public.leave_requests;
DROP POLICY IF EXISTS "leave_insert_own" ON public.leave_requests;
DROP POLICY IF EXISTS "leave_update_approver" ON public.leave_requests;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leave_select_own" ON public.leave_requests FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "leave_select_approver" ON public.leave_requests FOR SELECT USING ((auth.jwt()->'user_metadata'->>'role')::text IN ('admin', 'manager'));
CREATE POLICY "leave_insert_own" ON public.leave_requests FOR INSERT WITH CHECK (employee_id = auth.uid());
CREATE POLICY "leave_update_approver" ON public.leave_requests FOR UPDATE USING ((auth.jwt()->'user_metadata'->>'role')::text IN ('admin', 'manager')) WITH CHECK (true);

-- 3. overtime_requests（注意下划线！）
DROP POLICY IF EXISTS "overtime_select_own" ON public.overtime_requests;
DROP POLICY IF EXISTS "overtime_select_approver" ON public.overtime_requests;
DROP POLICY IF EXISTS "overtime_insert_own" ON public.overtime_requests;
DROP POLICY IF EXISTS "overtime_update_approver" ON public.overtime_requests;
ALTER TABLE public.overtime_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "overtime_select_own" ON public.overtime_requests FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "overtime_select_approver" ON public.overtime_requests FOR SELECT USING ((auth.jwt()->'user_metadata'->>'role')::text IN ('admin', 'manager'));
CREATE POLICY "overtime_insert_own" ON public.overtime_requests FOR INSERT WITH CHECK (employee_id = auth.uid());
CREATE POLICY "overtime_update_approver" ON public.overtime_requests FOR UPDATE USING ((auth.jwt()->'user_metadata'->>'role')::text IN ('admin', 'manager')) WITH CHECK (true);

-- 4. 验证结果
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('attendance_records', 'leave_requests', 'overtime_requests')
ORDER BY tablename, policyname;

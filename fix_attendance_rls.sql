-- ============================================
-- 修复 attendance_records 表 RLS 策略（避免递归）
-- ============================================

-- 1. 删除所有旧策略
DROP POLICY IF EXISTS "attendance_select_own" ON public.attendance_records;
DROP POLICY IF EXISTS "attendance_select_approver" ON public.attendance_records;
DROP POLICY IF EXISTS "attendance_insert_any" ON public.attendance_records;
DROP POLICY IF EXISTS "attendance_update_admin" ON public.attendance_records;

-- 2. 确保 RLS 开启
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- 3. 创建新策略（从 JWT 获取 role，避免递归）
CREATE POLICY "attendance_select_own"
    ON public.attendance_records FOR SELECT
    USING (employee_id = auth.uid());

CREATE POLICY "attendance_select_approver"
    ON public.attendance_records FOR SELECT
    USING (
        (auth.jwt()->'user_metadata'->>'role')::text IN ('admin', 'manager')
    );

CREATE POLICY "attendance_insert_own"
    ON public.attendance_records FOR INSERT
    WITH CHECK (employee_id = auth.uid());

CREATE POLICY "attendance_update_admin"
    ON public.attendance_records FOR UPDATE
    USING (
        (auth.jwt()->'user_metadata'->>'role')::text = 'admin'
    )
    WITH CHECK (true);

-- 4. 验证结果
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'attendance_records'
ORDER BY policyname;

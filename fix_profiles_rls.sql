-- ============================================
-- 修复 profiles 表 RLS 策略（无递归，无函数）
-- 原理：从 auth.jwt() 直接获取 role，不查 profiles 表
-- ============================================

-- 1. 删除所有旧策略
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_manager" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- 2. 确保 RLS 开启
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. 创建策略（从 JWT 的 user_metadata 获取 role，避免递归）
-- 策略1：用户查看自己的记录
CREATE POLICY "profiles_select_own"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

-- 策略2：管理员/人事查看所有记录（从 JWT 获取 role，不查表）
CREATE POLICY "profiles_select_admin"
    ON public.profiles FOR SELECT
    USING (
        (auth.jwt()->'user_metadata'->>'role')::text IN ('admin', 'manager')
    );

-- 策略3：用户更新自己的记录
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- 策略4：管理员更新所有记录（从 JWT 获取 role）
CREATE POLICY "profiles_update_admin"
    ON public.profiles FOR UPDATE
    USING (
        (auth.jwt()->'user_metadata'->>'role')::text = 'admin'
    )
    WITH CHECK (true);

-- 4. 验证结果
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ============================================
-- 清理残留的 SQL 直接插入记录（导致 GoTrue 不兼容）
-- 执行环境：Supabase Dashboard → SQL Editor
-- ============================================

-- 1. 先删除 public.profiles 中的 demo 记录
DELETE FROM public.profiles WHERE email LIKE '%_demo@test.com';

-- 2. 删除 auth.users 中的 demo 记录（SQL 直接插入的，GoTrue 不识别）
DELETE FROM auth.users WHERE email LIKE '%_demo@test.com';

-- 3. 验证清理结果
SELECT 'auth.users 残留' as check_item, count(*) as count FROM auth.users WHERE email LIKE '%_demo@test.com'
UNION ALL
SELECT 'profiles 残留', count(*) FROM public.profiles WHERE email LIKE '%_demo@test.com';

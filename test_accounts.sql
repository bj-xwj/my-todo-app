-- ============================================
-- 员工考勤管理系统 - 测试账号生成脚本（修复版）
-- 执行环境: Supabase SQL Editor
-- ============================================

-- 1. 确保扩展可用
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. 修复触发器函数（自动同步 auth.users → profiles）
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, department, role, created_at, updated_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'department', '未分配'),
    coalesce(new.raw_user_meta_data->>'role', 'employee')::user_role,
    now(),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    department = excluded.department,
    role = excluded.role,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- 3. 确保触发器存在
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. 创建测试账号（先删除已存在的，避免冲突）
DO $$
DECLARE
  v_emp_id uuid := gen_random_uuid();
  v_hr_id uuid := gen_random_uuid();
  v_adm_id uuid := gen_random_uuid();
BEGIN
  -- 先删除已存在的测试账号（避免主键/唯一冲突）
  DELETE FROM auth.users WHERE email IN ('employee_demo@test.com', 'hr_demo@test.com', 'admin_demo@test.com');
  
  -- 员工：张三
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (v_emp_id, 'employee_demo@test.com', crypt('Test123456!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"张三","department":"技术部","role":"employee"}'::jsonb,
    now(), now());

  -- 人事：李四
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (v_hr_id, 'hr_demo@test.com', crypt('Test123456!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"李四","department":"人事部","role":"manager"}'::jsonb,
    now(), now());

  -- 管理员：王五
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (v_adm_id, 'admin_demo@test.com', crypt('Test123456!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"王五","department":"管理部","role":"admin"}'::jsonb,
    now(), now());

  -- 确保 profiles 记录存在
  INSERT INTO public.profiles (id, email, full_name, department, role, created_at, updated_at)
  SELECT id, email,
    COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
    COALESCE(raw_user_meta_data->>'department', '未分配'),
    COALESCE(raw_user_meta_data->>'role', 'employee')::user_role,
    now(), now()
  FROM auth.users
  WHERE email IN ('employee_demo@test.com', 'hr_demo@test.com', 'admin_demo@test.com')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    department = EXCLUDED.department,
    role = EXCLUDED.role,
    updated_at = now();

  RAISE NOTICE '========================================';
  RAISE NOTICE '测试账号创建成功！';
  RAISE NOTICE '员工: employee_demo@test.com';
  RAISE NOTICE '人事: hr_demo@test.com';
  RAISE NOTICE '管理: admin_demo@test.com';
  RAISE NOTICE '密码: Test123456!';
  RAISE NOTICE '========================================';
END $$;

-- 5. 验证结果
select u.email, p.full_name as 姓名, p.department as 部门, p.role as 权限
from auth.users u
left join public.profiles p on u.id = p.id
where u.email like '%_demo@test.com';

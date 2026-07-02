-- ============================================
-- 测试账号创建脚本（最终修复版）
-- 先删除已存在的，再重新创建
-- ============================================

-- 1. 先删除已有的测试账号（避免冲突）
DELETE FROM auth.users WHERE email IN ('employee_demo@test.com', 'hr_demo@test.com', 'admin_demo@test.com');

-- 2. 创建序列（给员工编号用）
CREATE SEQUENCE IF NOT EXISTS employee_no_seq START 1;

-- 3. 创建三个账号
DO $$
DECLARE
  v_emp_id uuid := gen_random_uuid();
  v_hr_id uuid := gen_random_uuid();
  v_adm_id uuid := gen_random_uuid();
BEGIN
  -- 员工：张三
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (v_emp_id, 'employee_demo@test.com', crypt('Test123456!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"张三"}'::jsonb, now(), now());

  INSERT INTO public.profiles (id, employee_no, email, full_name, department, role)
  VALUES (v_emp_id, 'EMP'||LPAD(nextval('employee_no_seq')::text,3,'0'),
    'employee_demo@test.com', '张三', '技术部', 'employee');

  -- 人事：李四
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (v_hr_id, 'hr_demo@test.com', crypt('Test123456!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"李四"}'::jsonb, now(), now());

  INSERT INTO public.profiles (id, employee_no, email, full_name, department, role)
  VALUES (v_hr_id, 'EMP'||LPAD(nextval('employee_no_seq')::text,3,'0'),
    'hr_demo@test.com', '李四', '人事部', 'manager');

  -- 管理员：王五
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (v_adm_id, 'admin_demo@test.com', crypt('Test123456!', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"王五"}'::jsonb, now(), now());

  INSERT INTO public.profiles (id, employee_no, email, full_name, department, role)
  VALUES (v_adm_id, 'EMP'||LPAD(nextval('employee_no_seq')::text,3,'0'),
    'admin_demo@test.com', '王五', '管理部', 'admin');

  RAISE NOTICE '========================================';
  RAISE NOTICE '测试账号创建成功！';
  RAISE NOTICE '员工: employee_demo@test.com / Test123456!';
  RAISE NOTICE '人事: hr_demo@test.com / Test123456!';
  RAISE NOTICE '管理: admin_demo@test.com / Test123456!';
  RAISE NOTICE '========================================';
END $$;

-- 4. 验证结果
SELECT u.email, p.employee_no, p.full_name AS 姓名, p.department AS 部门, p.role AS 权限
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%_demo@test.com';

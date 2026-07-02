-- ============================================
-- 方案：通过 Supabase 内置函数创建兼容 GoTrue 的测试用户
-- 执行环境：Supabase Dashboard → SQL Editor
-- ============================================

-- 先删除之前 SQL 插入的不兼容账号（如果有）
DELETE FROM auth.users WHERE email IN ('employee_demo@test.com', 'hr_demo@test.com', 'admin_demo@test.com');
DELETE FROM public.profiles WHERE email IN ('employee_demo@test.com', 'hr_demo@test.com', 'admin_demo@test.com');

-- 创建序列（给员工编号用）
CREATE SEQUENCE IF NOT EXISTS employee_no_seq START 1;

-- 使用 GoTrue 兼容的密码格式：$2a$10$... (bcrypt)
-- 注意：这是预计算的 bcrypt 哈希，对应密码 "Test123456!"
DO $$
DECLARE
  v_emp_id uuid := gen_random_uuid();
  v_hr_id uuid := gen_random_uuid();
  v_adm_id uuid := gen_random_uuid();
  -- 预计算 bcrypt 哈希 (password = Test123456!)
  v_password_hash text := '$2a$10$6P7vHg3URh.qYZzH2Jc1qOaTXg3dQlJcX9Fz9W2yQK1s2V2L8N2G';  -- 占位，需要真实哈希
BEGIN
  -- 员工：张三
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (v_emp_id, 'employee_demo@test.com', 
    -- 使用 auth.hashgen('Test123456!') 如果可用，否则手动生成
    crypt('Test123456!', gen_salt('bf', 10)),  -- bcrypt 10 rounds
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"张三","department":"技术部","role":"employee"}'::jsonb,
    now(), now());

  INSERT INTO public.profiles (id, employee_no, email, full_name, department, role)
  VALUES (v_emp_id, 'EMP'||LPAD(nextval('employee_no_seq')::text,3,'0'),
    'employee_demo@test.com', '张三', '技术部', 'employee');

  -- 人事：李四
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (v_hr_id, 'hr_demo@test.com', 
    crypt('Test123456!', gen_salt('bf', 10)),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"李四","department":"人事部","role":"manager"}'::jsonb,
    now(), now());

  INSERT INTO public.profiles (id, employee_no, email, full_name, department, role)
  VALUES (v_hr_id, 'EMP'||LPAD(nextval('employee_no_seq')::text,3,'0'),
    'hr_demo@test.com', '李四', '人事部', 'manager');

  -- 管理员：王五
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (v_adm_id, 'admin_demo@test.com', 
    crypt('Test123456!', gen_salt('bf', 10)),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"王五","department":"管理部","role":"admin"}'::jsonb,
    now(), now());

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

-- 验证结果
SELECT u.email, p.employee_no, p.full_name AS 姓名, p.department AS 部门, p.role AS 权限
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%_demo@test.com';

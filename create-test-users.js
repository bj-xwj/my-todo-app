const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少环境变量：NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
  console.error('请确保 .env.local 文件存在且包含这些变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  {
    email: 'employee_demo@test.com',
    password: 'Test123456!',
    user_metadata: {
      name: '张三',
      department: '技术部',
      role: 'employee'
    }
  },
  {
    email: 'hr_demo@test.com',
    password: 'Test123456!',
    user_metadata: {
      name: '李四',
      department: '人事部',
      role: 'manager'
    }
  },
  {
    email: 'admin_demo@test.com',
    password: 'Test123456!',
    user_metadata: {
      name: '王五',
      department: '管理部',
      role: 'admin'
    }
  }
];

async function createTestUsers() {
  console.log('🚀 开始创建测试账号...\n');
  
  for (const user of testUsers) {
    try {
      // 先检查用户是否已存在
      const { data: existingUsers } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', user.email)
        .single();
      
      if (existingUsers) {
        console.log(`⚠️  ${user.email} 已存在，跳过`);
        continue;
      }

      // 使用 Supabase Auth API 创建用户（Service Role Key 可跳过邮箱验证）
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,  // 直接标记为已验证，无需点击邮件
        user_metadata: user.user_metadata
      });

      if (error) {
        console.error(`❌  ${user.email} 创建失败:`, error.message);
        continue;
      }

      console.log(`✅  ${user.email} 创建成功`);
      console.log(`   姓名: ${user.user_metadata.name}`);
      console.log(`   部门: ${user.user_metadata.department}`);
      console.log(`   权限: ${user.user_metadata.role}`);
      console.log(`   UID:  ${data.user.id}\n`);

    } catch (err) {
      console.error(`❌  ${user.email} 异常:`, err.message);
    }
  }

  console.log('🎉 全部完成！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('员工: employee_demo@test.com / Test123456!');
  console.log('人事: hr_demo@test.com / Test123456!');
  console.log('管理: admin_demo@test.com / Test123456!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

createTestUsers().catch(console.error);

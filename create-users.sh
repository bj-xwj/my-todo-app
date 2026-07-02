#!/bin/bash
# ============================================
# Supabase 测试账号创建脚本
# 替换 YOUR_SERVICE_ROLE_KEY 后执行
# ============================================

PROJECT_URL="https://ahkkemuhsdadejdmzyle.supabase.co"
SERVICE_KEY="YOUR_SERVICE_ROLE_KEY"

# 检查 key 是否已替换
if [ "$SERVICE_KEY" = "YOUR_SERVICE_ROLE_KEY" ]; then
  echo "❌ 请先编辑脚本，把 YOUR_SERVICE_ROLE_KEY 替换为你的 Service Role Key"
  exit 1
fi

echo "🚀 开始创建测试账号..."

# 员工：张三
curl -s -X POST "$PROJECT_URL/auth/v1/admin/users" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee_demo@test.com",
    "password": "Test123456!",
    "email_confirm": true,
    "user_metadata": {"name":"张三","department":"技术部","role":"employee"}
  }' | jq . 2>/dev/null || echo "请求完成（请检查 Dashboard 是否创建成功）"

echo "✅ 员工账号创建请求已发送"

# 人事：李四
curl -s -X POST "$PROJECT_URL/auth/v1/admin/users" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hr_demo@test.com",
    "password": "Test123456!",
    "email_confirm": true,
    "user_metadata": {"name":"李四","department":"人事部","role":"manager"}
  }' | jq . 2>/dev/null || echo "请求完成"

echo "✅ 人事账号创建请求已发送"

# 管理员：王五
curl -s -X POST "$PROJECT_URL/auth/v1/admin/users" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin_demo@test.com",
    "password": "Test123456!",
    "email_confirm": true,
    "user_metadata": {"name":"王五","department":"管理部","role":"admin"}
  }' | jq . 2>/dev/null || echo "请求完成"

echo "✅ 管理账号创建请求已发送"

echo ""
echo "🎉 全部完成！请检查 Dashboard → Authentication → Users 确认"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "员工: employee_demo@test.com / Test123456!"
echo "人事: hr_demo@test.com / Test123456!"
echo "管理: admin_demo@test.com / Test123456!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

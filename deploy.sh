#!/bin/bash
# 自动部署脚本 - 构建 + 启动 + 健康检测
set -e

APP_DIR="/root/.openclaw/workspace"
LOG_FILE="/tmp/attendance-server.log"
PORT=${PORT:-3000}
PAGES=("/" "/login" "/register")

cd "$APP_DIR"

echo "=== 1/4 拉取最新代码 ==="
git pull origin main || echo "⚠️  Git pull 失败，继续本地构建"

echo ""
echo "=== 2/4 构建 ==="
rm -rf .next
NODE_OPTIONS="--max-old-space-size=4096" npm run build 2>&1 | tee /tmp/build.log

if grep -q "Build failed" /tmp/build.log; then
  echo "❌ 构建失败！"
  cat /tmp/build.log
  exit 1
fi
echo "✅ 构建成功"

echo ""
echo "=== 3/4 重启服务 ==="
# 杀掉旧进程
pkill -f "next start" 2>/dev/null || true
sleep 2

PORT=$PORT nohup npm start > "$LOG_FILE" 2>&1 &
echo "PID: $!"
sleep 5

echo ""
echo "=== 4/4 健康检测 ==="
ERRORS=0

# 检查进程
if ! pgrep -f "next start" > /dev/null; then
  echo "❌ 服务未启动！"
  cat "$LOG_FILE"
  exit 1
fi

# 检查日志错误
if grep -iE "error|fail|crash" "$LOG_FILE" | grep -v "node_modules" > /dev/null; then
  echo "⚠️  检测到运行时错误："
  grep -iE "error|fail|crash" "$LOG_FILE"
  ERRORS=$((ERRORS + 1))
fi

# 检查页面可达性
for PAGE in "${PAGES[@]}"; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT$PAGE" --max-time 10)
  if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 400 ]; then
    echo "  ✅ $PAGE → $HTTP_CODE"
  else
    echo "  ❌ $PAGE → $HTTP_CODE"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "🎉 部署完成！服务运行在 http://localhost:$PORT"
else
  echo "⚠️  部署完成但有 $ERRORS 个问题，请检查日志: $LOG_FILE"
  exit 1
fi

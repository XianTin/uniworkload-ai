#!/usr/bin/env bash
# UniWorkload AI - Live Pilot Launcher (Backend + Frontend + Cloudflare HTTPS Tunnel)
# สาขาวิชาสาธารณสุขศาสตร์ / คณะวิทยาการจัดการ / มหาวิทยาลัยราชภัฏนครสวรรค์

set -e
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "========================================================"
echo " 🔮 UniWorkload AI - Live Pilot System"
echo " มหาวิทยาลัยราชภัฏนครสวรรค์ (NSRU)"
echo "========================================================"

# Kill any existing lingering servers on ports 5001, 5173
fuser -k 5001/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
pkill -f "cloudflared tunnel --url http://localhost:5173" 2>/dev/null || true
sleep 1

# 1. Start Backend Server (Port 5001)
echo "🚀 [1/3] Starting Backend API (Port 5001)..."
node server/server.js > /tmp/uniworkload-backend.log 2>&1 &
BACKEND_PID=$!

# 2. Start Frontend Vite Server (Port 5173)
echo "⚡ [2/3] Starting Vite Frontend (Port 5173)..."
npx vite --host > /tmp/uniworkload-frontend.log 2>&1 &
FRONTEND_PID=$!

# 3. Start Cloudflare Tunnel for Mobile & Remote Access
echo "🌐 [3/3] Launching Cloudflare HTTPS Tunnel..."
/home/xiantie/.local/bin/cloudflared tunnel --url http://localhost:5173 > /tmp/uniworkload-tunnel.log 2>&1 &
TUNNEL_PID=$!

# Wait for tunnel URL to appear in log
TUNNEL_URL=""
for i in {1..20}; do
  sleep 1
  if grep -q "trycloudflare.com" /tmp/uniworkload-tunnel.log 2>/dev/null; then
    TUNNEL_URL=$(grep -o 'https://[-a-zA-Z0-9.]*\.trycloudflare\.com' /tmp/uniworkload-tunnel.log | head -n 1)
    if [ -n "$TUNNEL_URL" ]; then
      break
    fi
  fi
done

echo ""
echo "========================================================"
echo " 🎉 SYSTEM READY FOR PILOT TESTING!"
echo "========================================================"
echo " 💻 Local Access (PC):"
echo "    👉 Frontend: http://localhost:5173"
echo "    👉 Backend:  http://localhost:5001"
echo ""
if [ -n "$TUNNEL_URL" ]; then
  echo " 📱 Live HTTPS URL for Mobile / Teachers Anywhere:"
  echo "    👉 $TUNNEL_URL"
  echo ""
  # Register tunnel URL with backend
  curl -s -X POST http://localhost:5001/api/tunnel/register \
       -H "Content-Type: application/json" \
       -d "{\"url\": \"$TUNNEL_URL\"}" > /dev/null 2>&1 || true
else
  echo " ⚠️ Tunnel URL still connecting in background, check: cat /tmp/uniworkload-tunnel.log"
fi
echo "========================================================"
echo "Press Ctrl+C to stop all services."

cleanup() {
  echo ""
  echo "🛑 Stopping services..."
  kill $BACKEND_PID $FRONTEND_PID $TUNNEL_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

wait $FRONTEND_PID

#!/usr/bin/env bash
# UniWorkload AI - Interactive Prototype Launcher
# สาขาวิชาเทคโนโลยีสารสนเทศ คณะวิทยาการจัดการ มรภ.นครสวรรค์

set -e
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "========================================================"
echo " 🔮 UniWorkload AI - Interactive Web Mockup (v2.0.0)"
echo " คณะวิทยาการจัดการ มหาวิทยาลัยราชภัฏนครสวรรค์"
echo "========================================================"
echo ""
echo "📦 Starting Vite Dev Server on http://localhost:5173..."
npm run dev -- --host

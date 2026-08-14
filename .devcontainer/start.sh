#!/usr/bin/env bash
# GitHub Codespaces가 컨테이너를 만들거나 다시 켤 때마다 자동으로 실행된다
# (devcontainer.json의 postStartCommand). 사람이 터미널에 아무것도 입력할
# 필요가 없도록, 설치가 안 되어 있으면 설치하고 두 서버를 백그라운드로 켠다.

set -e
cd "$(dirname "$0")/.."
REPO_ROOT="$(pwd)"

if [ ! -d "$REPO_ROOT/review-admin/node_modules" ]; then
  echo "[검수 화면] 처음 실행 — 설치 중... (1분 정도 걸릴 수 있음)"
  (cd "$REPO_ROOT/review-admin" && npm install)
fi

if [ ! -d "$REPO_ROOT/app/node_modules" ]; then
  echo "[식구용 화면] 처음 실행 — 설치 중..."
  (cd "$REPO_ROOT/app" && npm install)
fi

# 재시작 시 이미 떠 있는 이전 서버 프로세스가 있으면 정리한다.
pkill -f "node .*review-admin/server.js" 2>/dev/null || true
pkill -f "node .*[^n]app/server.js" 2>/dev/null || true
sleep 1

mkdir -p /tmp/happynian-logs
(cd "$REPO_ROOT/review-admin" && PORT=4000 nohup node server.js > /tmp/happynian-logs/review-admin.log 2>&1 &)
(cd "$REPO_ROOT/app" && PORT=4100 nohup node server.js > /tmp/happynian-logs/app.log 2>&1 &)

sleep 1
echo "검수 화면(4000)과 식구용 화면(4100)을 백그라운드로 시작했습니다."
echo "포트가 열리면 브라우저 탭이 자동으로 뜹니다 (Codespaces 포트 알림)."

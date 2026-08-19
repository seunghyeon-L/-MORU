#!/usr/bin/env bash
# ─────────────────────────────────────────────
#  서버 배포
#
#  사용법:  bash server/deploy.sh
#           (Windows 는 Git Bash 에서)
#
#  하는 일
#    1. 코드를 서버로 보낸다
#    2. requirements.txt 를 다시 설치한다  ← 이게 빠져서 502 가 났었다
#    3. 재시작하고 실제로 살아났는지 확인한다
#    4. 안 살아나면 로그를 보여주고 실패로 끝낸다
#
#  ⚠️ 마이그레이션은 자동으로 안 돈다.
#     server/db/00N-*.sql 을 새로 만들었으면 먼저 적용할 것.
# ─────────────────────────────────────────────
set -euo pipefail

KEY="${MORU_SSH_KEY:-$HOME/.ssh/moru_gabia}"
HOST="root@1.201.117.54"
REMOTE="/opt/moru"
BASE="https://1-201-117-54.sslip.io"

cd "$(dirname "$0")"

if [ ! -f "$KEY" ]; then
    echo "SSH 키가 없습니다: $KEY"
    echo "  MORU_SSH_KEY 환경변수로 경로를 지정할 수 있습니다."
    exit 1
fi

SSH="ssh -i $KEY -o StrictHostKeyChecking=no -o BatchMode=yes $HOST"

echo "[1/4] 코드 전송"
tar czf - \
    main.py schemas.py deps.py db_session.py models.py requirements.txt \
    routes services db tests \
  | $SSH "cd $REMOTE && tar xzf -"

echo "[2/4] 의존성 설치"
$SSH "$REMOTE/venv/bin/pip install -q -r $REMOTE/requirements.txt"

echo "[3/4] 재시작"
$SSH "systemctl restart moru"
sleep 4

echo "[4/4] 확인"
STATUS=$($SSH "systemctl is-active moru" || true)
if [ "$STATUS" != "active" ]; then
    echo
    echo "  서버가 안 떴습니다 ($STATUS). 최근 로그:"
    echo "  ─────────────────────────────────────"
    $SSH "journalctl -u moru -n 30 --no-pager | grep -v 'INFO:' | tail -15"
    exit 1
fi

CODE=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/health" || true)
if [ "$CODE" != "200" ]; then
    echo "  /health 가 $CODE 를 돌려줍니다. nginx 나 인증서를 확인하세요."
    exit 1
fi

echo
echo "  배포 완료.  $BASE/docs"

#!/usr/bin/env bash
# Sobe GamaGit completo sob um único domínio estável (ngrok).
# Uso: bash start-all.sh
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
NGROK="/c/Users/Usuario/AppData/Local/ngrok/ngrok.exe"
DOMAIN="karate-ashes-rewash.ngrok-free.dev"   # domínio estático grátis da conta

echo "==> Backend (Node :8787)"
( cd "$ROOT/server" && node src/index.js ) &
echo "==> Frontend (Vite :8080, faz proxy de /api,/auth/instagram,/health,/scheduler -> :8787)"
( cd "$ROOT" && bun run dev ) &
sleep 5
echo "==> ngrok -> https://$DOMAIN (aponta para o frontend :8080)"
"$NGROK" http 8080 --url="$DOMAIN" --log=stdout &

cat <<EOF

GamaGit no ar sob: https://$DOMAIN
- App (agência):     https://$DOMAIN
- Painel backend:    https://$DOMAIN/health
- OAuth Instagram:   https://$DOMAIN/auth/instagram/callback  (já registrado no Meta)
- Link de aprovação: https://$DOMAIN/review/<token>
- Portal do cliente: https://$DOMAIN/portal/<token>

Para parar: feche este terminal (ou mate node/ngrok).
EOF
wait

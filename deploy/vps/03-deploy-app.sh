#!/bin/bash
# Deploy / cap nhat app trong /var/www/qr-ordering
# Can file .env production tai /var/www/qr-ordering/.env

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/qr-ordering}"
SEED="${RUN_DB_SEED:-false}"

cd "$APP_DIR"

if [ ! -f .env ]; then
  echo "LOI: Chua co file .env trong $APP_DIR"
  echo "Copy tu deploy/vps/env.production.template va chinh sua."
  exit 1
fi

echo "==> npm install..."
npm ci

echo "==> Build frontend + Prisma..."
npm run build

echo "==> Migrate database..."
npx prisma migrate deploy

if [ "$SEED" = "true" ]; then
  echo "==> Seed demo (chi lan dau)..."
  npm run db:seed
fi

echo "==> PM2..."
if pm2 describe qr-ordering &>/dev/null; then
  pm2 reload deploy/vps/ecosystem.config.cjs --update-env
else
  pm2 start deploy/vps/ecosystem.config.cjs
fi
pm2 save

echo ""
echo "OK — App dang chay port 8080"
pm2 status

#!/bin/bash
# Chay tren VPS Ubuntu 22.04/24.04 (root hoac sudo)
# curl -fsSL ... | bash   HOAC   bash 01-install-server.sh

set -euo pipefail

echo "==> Cap nhat he thong..."
apt-get update -y
apt-get upgrade -y

echo "==> Cai dat Node.js 20..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v
npm -v

echo "==> Cai dat MySQL, Nginx, Certbot, Git..."
DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server nginx certbot python3-certbot-nginx git ufw

echo "==> Cai dat PM2..."
npm install -g pm2

echo "==> Firewall (SSH + HTTP + HTTPS)..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Thu muc ung dung..."
mkdir -p /var/www/qr-ordering
chown -R "$SUDO_USER:${SUDO_USER}" /var/www/qr-ordering 2>/dev/null || true

echo ""
echo "OK — Da cai xong Node, MySQL, Nginx, PM2, Certbot"
echo "Tiep theo: bash 02-setup-database.sh"

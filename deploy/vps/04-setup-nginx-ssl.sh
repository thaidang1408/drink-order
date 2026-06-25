#!/bin/bash
# Cau hinh Nginx + SSL Let's Encrypt
# Usage: DOMAIN=order.example.com bash 04-setup-nginx-ssl.sh

set -euo pipefail

DOMAIN="${DOMAIN:?Dat DOMAIN, vd: DOMAIN=order.example.com bash 04-setup-nginx-ssl.sh}"
APP_DIR="${APP_DIR:-/var/www/qr-ordering}"

sed "s/YOUR_DOMAIN/${DOMAIN}/g" "$APP_DIR/deploy/vps/nginx-site.conf" \
  | sudo tee /etc/nginx/sites-available/qr-ordering >/dev/null

sudo ln -sf /etc/nginx/sites-available/qr-ordering /etc/nginx/sites-enabled/qr-ordering
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl reload nginx

echo "==> Cap SSL (Let's Encrypt)..."
sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "admin@${DOMAIN}" --redirect || {
  echo "Certbot that bai — chay thu cong: sudo certbot --nginx -d $DOMAIN"
  exit 1
}

echo ""
echo "OK — HTTPS: https://${DOMAIN}"

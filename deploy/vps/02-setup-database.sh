#!/bin/bash
# Tao database va user MySQL cho QR Ordering
# Usage: DB_PASSWORD='mat-khau-manh' bash 02-setup-database.sh

set -euo pipefail

DB_NAME="${DB_NAME:-qr_ordering}"
DB_USER="${DB_USER:-qrorder}"
DB_PASSWORD="${DB_PASSWORD:?Dat DB_PASSWORD truoc khi chay, vd: DB_PASSWORD='MyStr0ngPass!' bash 02-setup-database.sh}"

echo "==> Tao database $DB_NAME va user $DB_USER ..."

mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

echo ""
echo "OK — Database san sang"
echo "DATABASE_URL=\"mysql://${DB_USER}:${DB_PASSWORD}@localhost:3306/${DB_NAME}\""

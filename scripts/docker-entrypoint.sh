#!/bin/sh
set -e

echo "[deploy] Applying database migrations..."
npx prisma migrate deploy

if [ "${RUN_DB_SEED}" = "true" ]; then
  echo "[deploy] Seeding demo data (demo-cafe)..."
  node prisma/seed.js
fi

echo "[deploy] Starting server on port ${PORT:-8080}..."
exec node src/server.js

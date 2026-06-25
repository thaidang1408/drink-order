# Deploy thử production trên máy local (không Docker)
# Dùng MySQL trong .env (vd localhost:3307)

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

Write-Host "==> Giai phong port 8080..." -ForegroundColor Cyan
npm run port:free 2>$null

Write-Host "==> Build frontend + Prisma..." -ForegroundColor Cyan
npm run build

Write-Host "==> DB migrate..." -ForegroundColor Cyan
npx prisma migrate deploy

$env:RUN_DB_SEED = if ($env:RUN_DB_SEED) { $env:RUN_DB_SEED } else { "false" }

if ($env:RUN_DB_SEED -eq "true") {
  Write-Host "==> Seed demo data..." -ForegroundColor Cyan
  npm run db:seed
}

$env:NODE_ENV = "production"
if (-not $env:FRONTEND_URL) { $env:FRONTEND_URL = "http://localhost:8080" }
$env:CORS_ORIGIN = $env:FRONTEND_URL
$env:SOCKET_CORS_ORIGIN = $env:FRONTEND_URL

Write-Host ""
Write-Host "Demo cafe (production mode):" -ForegroundColor Green
Write-Host "  Khach:  $env:FRONTEND_URL/store/demo-cafe"
Write-Host "  Admin:  $env:FRONTEND_URL/admin/login  (owner@demo.com / admin123)"
Write-Host ""

node src/server.js

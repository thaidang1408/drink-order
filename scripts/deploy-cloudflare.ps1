# Huong dan + khoi dong server cho Cloudflare Tunnel (HTTPS mien phi, khach bat ky mang nao)
# Ban can tu cai cloudflared va chay lenh tunnel o terminal khac (xem huong dan duoi)

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

Write-Host ""
Write-Host "=== QR Ordering — Chuan bi Cloudflare Tunnel ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
  Write-Host "Chua co cloudflared. Cai bang lenh:" -ForegroundColor Yellow
  Write-Host "  winget install Cloudflare.cloudflared" -ForegroundColor White
  Write-Host ""
  Write-Host "Hoac tai: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/" -ForegroundColor Gray
  Write-Host ""
}

Write-Host "BUOC 1 — Terminal A (file nay): chay server local port 8080" -ForegroundColor Cyan
Write-Host "BUOC 2 — Terminal B: chay tunnel:" -ForegroundColor Cyan
Write-Host "  cloudflared tunnel --url http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "BUOC 3 — Copy URL https://....trycloudflare.com tu Terminal B" -ForegroundColor Cyan
Write-Host "BUOC 4 — Dung server (Ctrl+C), sua .env:" -ForegroundColor Cyan
Write-Host "  FRONTEND_URL=https://xxx.trycloudflare.com" -ForegroundColor White
Write-Host "  CORS_ORIGIN=https://xxx.trycloudflare.com" -ForegroundColor White
Write-Host "  SOCKET_CORS_ORIGIN=https://xxx.trycloudflare.com" -ForegroundColor White
Write-Host "BUOC 5 — Chay lai script nay, dang nhap admin -> Ma QR -> tai QR moi" -ForegroundColor Cyan
Write-Host ""

$existingUrl = $env:FRONTEND_URL
if ($existingUrl -and $existingUrl -like 'https://*') {
  Write-Host "Dang dung FRONTEND_URL: $existingUrl" -ForegroundColor Green
} else {
  Write-Host "Tam thoi dung http://localhost:8080 — doi URL tunnel xong chay lai." -ForegroundColor Yellow
  $env:FRONTEND_URL = "http://localhost:8080"
  $env:CORS_ORIGIN = "http://localhost:8080"
  $env:SOCKET_CORS_ORIGIN = "http://localhost:8080"
}

$env:NODE_ENV = "production"
$env:PORT = "8080"
$env:RUN_DB_SEED = if ($env:RUN_DB_SEED) { $env:RUN_DB_SEED } else { "false" }

npm run port:free 2>$null
npm run build
npx prisma migrate deploy

if ($env:RUN_DB_SEED -eq "true") {
  npm run db:seed
}

Write-Host ""
Write-Host "Server dang chay... Mo terminal khac de chay cloudflared." -ForegroundColor Green
Write-Host ""

node src/server.js

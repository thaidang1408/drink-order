# Cloudflare Quick Tunnel - HTTPS mien phi, khach bat ky mang nao
# Terminal B: cloudflared tunnel --url http://localhost:8080

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

Write-Host ""
Write-Host "=== QR Ordering - Cloudflare Tunnel ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
  Write-Host "Chua co cloudflared. Cai mot trong cac cach sau:" -ForegroundColor Yellow
  Write-Host "  winget install Cloudflare.cloudflared" -ForegroundColor White
  Write-Host "  Hoac tai MSI tu GitHub:" -ForegroundColor White
  Write-Host "  https://github.com/cloudflare/cloudflared/releases/latest" -ForegroundColor Gray
  Write-Host ""
  Write-Host "Sau khi cai, dong PowerShell va mo lai, chay: cloudflared --version" -ForegroundColor Yellow
  Write-Host ""
}

Write-Host "BUOC 1 - Terminal A (script nay): chay server port 8080" -ForegroundColor Cyan
Write-Host "BUOC 2 - Terminal B: cloudflared tunnel --url http://localhost:8080" -ForegroundColor Cyan
Write-Host "BUOC 3 - Copy URL https://....trycloudflare.com tu Terminal B" -ForegroundColor Cyan
Write-Host "BUOC 4 - Dung server, sua .env (FRONTEND_URL, CORS_ORIGIN, SOCKET_CORS_ORIGIN)" -ForegroundColor Cyan
Write-Host "BUOC 5 - Chay lai script nay, vao admin -> Ma QR -> tai QR moi" -ForegroundColor Cyan
Write-Host ""

Remove-Item Env:FRONTEND_URL -ErrorAction SilentlyContinue
Remove-Item Env:CORS_ORIGIN -ErrorAction SilentlyContinue
Remove-Item Env:SOCKET_CORS_ORIGIN -ErrorAction SilentlyContinue

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
Write-Host "Server dang chay. Mo terminal khac de chay cloudflared." -ForegroundColor Green
Write-Host ""

node src/server.js

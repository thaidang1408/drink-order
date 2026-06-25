# Deploy public URL via LocalTunnel (no cloudflared/GitHub binary needed)

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

Write-Host ""
Write-Host "=== QR Ordering - Deploy with LocalTunnel ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "STEP 1 - Terminal A (this script): run app on port 8080" -ForegroundColor Cyan
Write-Host "STEP 2 - Terminal B: run tunnel:" -ForegroundColor Cyan
Write-Host "  npx localtunnel --port 8080" -ForegroundColor White
Write-Host ""
Write-Host "STEP 3 - Copy URL https://....loca.lt from Terminal B" -ForegroundColor Cyan
Write-Host "STEP 4 - Stop server (Ctrl+C), update .env:" -ForegroundColor Cyan
Write-Host "  FRONTEND_URL=https://xxx.loca.lt" -ForegroundColor White
Write-Host "  CORS_ORIGIN=https://xxx.loca.lt" -ForegroundColor White
Write-Host "  SOCKET_CORS_ORIGIN=https://xxx.loca.lt" -ForegroundColor White
Write-Host "STEP 5 - Run this script again, then re-download QR in admin" -ForegroundColor Cyan
Write-Host ""

# IMPORTANT:
# Do not override FRONTEND_URL/CORS/SOCKET here.
# Backend reads these values from .env via dotenv.
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
Write-Host "Server is running. Open another terminal and run localtunnel." -ForegroundColor Green
Write-Host ""

node src/server.js

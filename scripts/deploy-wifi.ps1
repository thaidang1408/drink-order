# Deploy production tren mang Wi-Fi noi bo (mien phi, khong can VPS)
# Khach trong cung Wi-Fi quan quet QR duoc

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

Write-Host ""
Write-Host "=== QR Ordering — Deploy Wi-Fi (cung mang quan) ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Dang tim IP Wi-Fi..." -ForegroundColor Gray
$wifiIp = (
  Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object {
      $_.IPAddress -notlike '127.*' -and
      $_.IPAddress -notlike '169.254.*' -and
      $_.PrefixOrigin -ne 'WellKnown'
    } |
    Sort-Object InterfaceMetric |
    Select-Object -First 1
)?.IPAddress

if (-not $wifiIp) {
  $wifiIp = Read-Host "Khong tu tim duoc IP. Nhap IPv4 may tinh (vd 192.168.1.105)"
}

$baseUrl = "http://${wifiIp}:8080"

Write-Host ""
Write-Host "URL he thong: $baseUrl" -ForegroundColor Green
Write-Host "Menu khach:    $baseUrl/store/demo-cafe" -ForegroundColor Green
Write-Host "Admin:         $baseUrl/admin/login" -ForegroundColor Green
Write-Host ""
Write-Host "Luu y: Dien thoai khach phai cung Wi-Fi voi may nay." -ForegroundColor Yellow
Write-Host ""

$env:NODE_ENV = "production"
$env:PORT = "8080"
$env:FRONTEND_URL = $baseUrl
$env:CORS_ORIGIN = $baseUrl
$env:SOCKET_CORS_ORIGIN = $baseUrl
$env:RUN_DB_SEED = if ($env:RUN_DB_SEED) { $env:RUN_DB_SEED } else { "false" }

Write-Host "==> Giai phong port 8080..." -ForegroundColor Cyan
npm run port:free 2>$null

Write-Host "==> Build..." -ForegroundColor Cyan
npm run build

Write-Host "==> Migrate DB..." -ForegroundColor Cyan
npx prisma migrate deploy

if ($env:RUN_DB_SEED -eq "true") {
  Write-Host "==> Seed demo..." -ForegroundColor Cyan
  npm run db:seed
}

Write-Host ""
Write-Host "=== Sau khi server chay ===" -ForegroundColor Cyan
Write-Host "1. Mo firewall port 8080 (neu dien thoai khong vao duoc)"
Write-Host "2. Dang nhap admin -> Ma QR -> tai QR moi (quan trong!)"
Write-Host "3. Mo Windows Firewall:" -ForegroundColor Gray
Write-Host "   New-NetFirewallRule -DisplayName 'QR Ordering' -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow" -ForegroundColor Gray
Write-Host ""
Write-Host "Nhan Ctrl+C de dung server." -ForegroundColor Gray
Write-Host ""

node src/server.js

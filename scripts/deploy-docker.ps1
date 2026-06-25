# Deploy thử bằng Docker (MySQL + API trong container)
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Host "Chua cai Docker Desktop. Tai: https://www.docker.com/products/docker-desktop/" -ForegroundColor Red
  exit 1
}

$env:FRONTEND_URL = "http://localhost:8080"
$env:CORS_ORIGIN = "http://localhost:8080"
$env:SOCKET_CORS_ORIGIN = "http://localhost:8080"
$env:RUN_DB_SEED = if ($env:RUN_DB_SEED) { $env:RUN_DB_SEED } else { "false" }
$env:MYSQL_PORT = "3308"
$env:APP_PORT = "8080"

Write-Host "==> Docker build & start..." -ForegroundColor Cyan
docker compose up --build -d

Write-Host ""
Write-Host "Doi MySQL khoi dong (20-40 giay)..." -ForegroundColor Yellow
Start-Sleep -Seconds 25

docker compose ps
docker compose logs api --tail 20

Write-Host ""
Write-Host "Demo cafe da deploy:" -ForegroundColor Green
Write-Host "  Khach:  http://localhost:8080/store/demo-cafe"
Write-Host "  Admin:  http://localhost:8080/admin/login  (owner@demo.com / admin123)"
Write-Host ""
Write-Host "Xem log:  docker compose logs -f api"
Write-Host "Dung:     docker compose down"

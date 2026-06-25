# Nen code len VPS bang SCP (chay tren Windows)
# Usage: .\scripts\upload-to-vps.ps1 -VpsUser ubuntu -VpsHost 1.2.3.4

param(
    [Parameter(Mandatory = $true)]
    [string]$VpsHost,
    [string]$VpsUser = "ubuntu",
    [string]$RemotePath = "/tmp/qr-ordering.tar.gz"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

$archive = Join-Path $env:TEMP "qr-ordering-deploy.tar.gz"
if (Test-Path $archive) { Remove-Item $archive -Force }

Write-Host "==> Dong goi project (bo node_modules)..."
Push-Location $root
tar -czf $archive `
    --exclude=node_modules `
    --exclude=frontend/node_modules `
    --exclude=frontend/dist `
    --exclude=.git `
    .
Pop-Location

Write-Host "==> Upload to ${VpsUser}@${VpsHost}..."
scp $archive "${VpsUser}@${VpsHost}:${RemotePath}"

Write-Host ""
Write-Host "Tren VPS chay:"
Write-Host "  sudo mkdir -p /var/www/qr-ordering"
Write-Host "  sudo tar -xzf $RemotePath -C /var/www/qr-ordering"
Write-Host "  sudo chown -R `$USER:`$USER /var/www/qr-ordering"
Write-Host "  cd /var/www/qr-ordering && chmod +x deploy/vps/*.sh"

# Script PowerShell para iniciar o backend do sistema

Write-Host "🚀 Iniciando servidor backend..." -ForegroundColor Green
Write-Host "📁 Navegando para pasta backend..." -ForegroundColor Cyan

Set-Location backend

Write-Host "📦 Verificando dependências..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "📥 Instalando dependências..." -ForegroundColor Yellow
    npm install
}

Write-Host "▶️  Iniciando servidor em modo desenvolvimento..." -ForegroundColor Green
npm run dev

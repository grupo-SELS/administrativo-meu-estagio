# Script para iniciar backend e frontend

Write-Host "`n🚀 Iniciando sistema de gestão de estágios...`n" -ForegroundColor Cyan

# Matar processos Node antigos
Write-Host "🔄 Encerrando processos antigos..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Iniciar backend
Write-Host "`n📦 Iniciando BACKEND na porta 3001..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host '=== BACKEND ===' -ForegroundColor Green; npm run dev"

# Aguardar backend iniciar
Write-Host "⏳ Aguardando backend iniciar (5 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Iniciar frontend
Write-Host "`n🎨 Iniciando FRONTEND na porta 5173..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host '=== FRONTEND ===' -ForegroundColor Blue; npm run dev"

Write-Host "`n✅ Ambos os servidores foram iniciados!" -ForegroundColor Green
Write-Host "`nAcesse: http://localhost:5173" -ForegroundColor Cyan
Write-Host "API: http://localhost:3001/health`n" -ForegroundColor Cyan

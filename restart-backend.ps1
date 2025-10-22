# Script para reiniciar o servidor backend automaticamente
Write-Host "Reiniciando servidor backend..." -ForegroundColor Cyan
Write-Host ""

# Encontrar o processo na porta 3001
Write-Host "Procurando processo na porta 3001..." -ForegroundColor Yellow
$connection = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue

if ($connection) {
    $processId = $connection.OwningProcess
    Write-Host "Processo encontrado: PID $processId" -ForegroundColor Green
    
    Write-Host "Parando processo..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "Processo parado!" -ForegroundColor Green
} else {
    Write-Host "Nenhum processo encontrado na porta 3001" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Iniciando servidor..." -ForegroundColor Cyan
Write-Host ""

# Mudar para o diretorio do backend
Set-Location "C:\Users\luiza\Desktop\site-adm-app\backend"

# Iniciar o servidor
npm run dev

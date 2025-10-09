# Script para remover console.log, console.warn e console.info (mantém console.error)

Write-Host "Removendo console.logs desnecessários..." -ForegroundColor Yellow

# Função para processar arquivos
function Remove-ConsoleLogs {
    param (
        [string]$Path
    )
    
    $files = Get-ChildItem -Path $Path -Include *.ts,*.tsx -Recurse -File
    $totalRemoved = 0
    
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw
        $originalContent = $content
        
        # Remove console.log
        $content = $content -replace "console\.log\([^)]*\);?\s*\n?", ""
        # Remove console.warn
        $content = $content -replace "console\.warn\([^)]*\);?\s*\n?", ""
        # Remove console.info  
        $content = $content -replace "console\.info\([^)]*\);?\s*\n?", ""
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $totalRemoved++
            Write-Host "✓ $($file.Name)" -ForegroundColor Green
        }
    }
    
    return $totalRemoved
}

# Processar backend
Write-Host "`n📦 Processando Backend..." -ForegroundColor Cyan
$backendRemoved = Remove-ConsoleLogs -Path ".\backend\controllers"
$backendRemoved += Remove-ConsoleLogs -Path ".\backend\routes"

# Processar frontend (exceto arquivos de teste)
Write-Host "`n🎨 Processando Frontend..." -ForegroundColor Cyan  
$frontendRemoved = Remove-ConsoleLogs -Path ".\frontend\src\pages"
$frontendRemoved += Remove-ConsoleLogs -Path ".\frontend\src\services"
$frontendRemoved += Remove-ConsoleLogs -Path ".\frontend\src\components"

Write-Host "`n✅ Concluído!" -ForegroundColor Green
Write-Host "Backend: $backendRemoved arquivos processados" -ForegroundColor White
Write-Host "Frontend: $frontendRemoved arquivos processados" -ForegroundColor White
Write-Host "Total: $($backendRemoved + $frontendRemoved) arquivos processados" -ForegroundColor White

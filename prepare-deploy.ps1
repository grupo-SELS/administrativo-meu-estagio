# ===============================================
# SCRIPT DE PREPARAÇÃO PARA DEPLOY - POWERSHELL
# ===============================================
# Este script prepara o projeto para deploy na VPS
# Execute: .\prepare-deploy.ps1
# ===============================================

Write-Host "🚀 Preparando projeto para deploy..." -ForegroundColor Cyan
Write-Host ""

# Verificar se estamos na pasta raiz do projeto
if (-not (Test-Path ".\backend") -or -not (Test-Path ".\frontend")) {
    Write-Host "❌ Erro: Execute este script na pasta raiz do projeto!" -ForegroundColor Red
    exit 1
}

# Criar pasta de deploy
Write-Host "📁 Criando pasta de deploy..." -ForegroundColor Yellow
$deployFolder = ".\deploy-ready"
if (Test-Path $deployFolder) {
    Remove-Item $deployFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $deployFolder | Out-Null
New-Item -ItemType Directory -Path "$deployFolder\backend" | Out-Null
New-Item -ItemType Directory -Path "$deployFolder\frontend-dist" | Out-Null

# ===============================================
# BACKEND
# ===============================================
Write-Host ""
Write-Host "⚙️  Preparando Backend..." -ForegroundColor Yellow
Write-Host "   - Copiando arquivos do backend..." -ForegroundColor Gray

# Copiar arquivos essenciais do backend
$backendFiles = @(
    "server.ts",
    "package.json",
    "package-lock.json",
    "tsconfig.json"
)

foreach ($file in $backendFiles) {
    Copy-Item ".\backend\$file" "$deployFolder\backend\" -ErrorAction SilentlyContinue
}

# Copiar pastas necessárias
$backendFolders = @("routes", "config", "middleware", "uploads")
foreach ($folder in $backendFolders) {
    if (Test-Path ".\backend\$folder") {
        Copy-Item ".\backend\$folder" "$deployFolder\backend\" -Recurse
    }
}

# Copiar .env.production como .env
if (Test-Path ".\backend\.env.production") {
    Copy-Item ".\backend\.env.production" "$deployFolder\backend\.env"
    Write-Host "   ✓ Arquivo .env de produção copiado" -ForegroundColor Green
    Write-Host "   ⚠️  LEMBRE-SE: Configure as variáveis do Firebase no .env!" -ForegroundColor Yellow
} else {
    Write-Host "   ⚠️  Atenção: .env.production não encontrado!" -ForegroundColor Red
}

# ===============================================
# FRONTEND
# ===============================================
Write-Host ""
Write-Host "🎨 Preparando Frontend..." -ForegroundColor Yellow

# Verificar se .env.production existe
if (-not (Test-Path ".\frontend\.env.production")) {
    Write-Host "   ❌ Erro: .\frontend\.env.production não encontrado!" -ForegroundColor Red
    Write-Host "   Configure o arquivo .env.production antes de continuar." -ForegroundColor Red
    exit 1
}

Write-Host "   - Verificando configurações do Firebase..." -ForegroundColor Gray
$envContent = Get-Content ".\frontend\.env.production" -Raw
if ($envContent -match "AIzaSy\.\.\.") {
    Write-Host "   ⚠️  ATENÇÃO: Configure as credenciais reais do Firebase em .\frontend\.env.production" -ForegroundColor Yellow
    Write-Host "   Deseja continuar mesmo assim? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "S" -and $response -ne "s") {
        Write-Host "   ❌ Deploy cancelado. Configure o Firebase e tente novamente." -ForegroundColor Red
        exit 1
    }
}

Write-Host "   - Fazendo build do frontend..." -ForegroundColor Gray
Set-Location frontend

# Instalar dependências se necessário
if (-not (Test-Path ".\node_modules")) {
    Write-Host "   - Instalando dependências do frontend..." -ForegroundColor Gray
    npm install
}

# Build de produção
Write-Host "   - Executando build de produção..." -ForegroundColor Gray
npm run build

if (-not (Test-Path ".\dist")) {
    Write-Host "   ❌ Erro: Build falhou! Pasta dist não foi criada." -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Copiar build
Write-Host "   - Copiando arquivos do build..." -ForegroundColor Gray
Copy-Item ".\dist\*" "..\$deployFolder\frontend-dist\" -Recurse
Set-Location ..

Write-Host "   ✓ Build do frontend concluído" -ForegroundColor Green

# ===============================================
# ARQUIVOS DE CONFIGURAÇÃO
# ===============================================
Write-Host ""
Write-Host "📝 Criando arquivos de configuração..." -ForegroundColor Yellow

# Criar .gitignore para a pasta deploy
@"
.env
node_modules/
*.log
.DS_Store
"@ | Out-File "$deployFolder\.gitignore" -Encoding UTF8

Write-Host "   ✓ Arquivos de configuração criados" -ForegroundColor Green

# ===============================================
# RESUMO
# ===============================================
Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Green
Write-Host "✅ Preparação concluída com sucesso!" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Green
Write-Host ""
Write-Host "📦 Pasta pronta para deploy: $deployFolder" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. ANTES DE ENVIAR para o servidor:" -ForegroundColor White
Write-Host "   - Edite: $deployFolder\backend\.env" -ForegroundColor Gray
Write-Host "   - Configure as credenciais do Firebase" -ForegroundColor Gray
Write-Host "   - Configure o JWT_SECRET (use: openssl rand -base64 32)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. ENVIAR para o servidor via SSH/SCP:" -ForegroundColor White
Write-Host "   scp -r $deployFolder\backend\ user@31.97.255.226:/var/www/site-adm-app/" -ForegroundColor Gray
Write-Host "   scp -r $deployFolder\frontend-dist\ user@31.97.255.226:/var/www/site-adm-app/" -ForegroundColor Gray
Write-Host ""
Write-Host "3. NO SERVIDOR, execute:" -ForegroundColor White
Write-Host "   cd /var/www/site-adm-app/backend" -ForegroundColor Gray
Write-Host "   npm install --production" -ForegroundColor Gray
Write-Host "   pm2 start ecosystem.config.js" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Configure o NGINX (veja: DEPLOY_VPS_COMPLETO.md)" -ForegroundColor White
Write-Host ""
Write-Host "Leia o guia completo em: DEPLOY_VPS_COMPLETO.md" -ForegroundColor Cyan
Write-Host ""

# Script de Setup para Firebase
# Execute este script após configurar o Firebase Console

Write-Host "🔥 Configurando Backend Firebase..." -ForegroundColor Cyan

# Verificar se Node.js está instalado
if (!(Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js não encontrado. Instale em: https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js encontrado" -ForegroundColor Green

# Instalar dependências se node_modules não existir
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependências instaladas" -ForegroundColor Green
} else {
    Write-Host "✅ Dependências já instaladas" -ForegroundColor Green
}

# Verificar se existe .env
if (!(Test-Path ".env")) {
    Write-Host "📝 Criando arquivo .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Arquivo .env criado a partir do exemplo" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANTE: Edite o arquivo .env com suas configurações Firebase!" -ForegroundColor Yellow
} else {
    Write-Host "✅ Arquivo .env já existe" -ForegroundColor Green
}

# Criar diretório config se não existir
if (!(Test-Path "config")) {
    Write-Host "📁 Criando diretório config..." -ForegroundColor Yellow
    New-Item -Type Directory -Name "config"
    Write-Host "✅ Diretório config criado" -ForegroundColor Green
}

# Verificar se service account key existe
$serviceAccountPath = "config/serviceAccountKey.json"
if (!(Test-Path $serviceAccountPath)) {
    Write-Host "⚠️  Service Account Key não encontrado em: $serviceAccountPath" -ForegroundColor Yellow
    Write-Host "💡 Para configurar:" -ForegroundColor Cyan
    Write-Host "   1. Acesse Firebase Console > Configurações > Contas de serviço" -ForegroundColor White
    Write-Host "   2. Clique em 'Gerar nova chave privada'" -ForegroundColor White
    Write-Host "   3. Salve o arquivo como 'config/serviceAccountKey.json'" -ForegroundColor White
    Write-Host "   OU configure a variável FIREBASE_SERVICE_ACCOUNT no .env" -ForegroundColor White
} else {
    Write-Host "✅ Service Account Key encontrado" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Configure Firebase Console (veja README.md)" -ForegroundColor White
Write-Host "   2. Edite o arquivo .env com suas configurações" -ForegroundColor White
Write-Host "   3. Execute: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentação completa no README.md" -ForegroundColor Cyan
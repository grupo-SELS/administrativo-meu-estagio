set -e  

echo "🚀 Preparando projeto para deploy..."
echo ""

if [ ! -d "./backend" ] || [ ! -d "./frontend" ]; then
    echo "❌ Erro: Execute este script na pasta raiz do projeto!"
    exit 1
fi

echo "📁 Criando pasta de deploy..."
DEPLOY_FOLDER="./deploy-ready"
rm -rf "$DEPLOY_FOLDER"
mkdir -p "$DEPLOY_FOLDER/backend"
mkdir -p "$DEPLOY_FOLDER/frontend-dist"

echo ""
echo "⚙️  Preparando Backend..."
echo "   - Copiando arquivos do backend..."


cp backend/server.ts "$DEPLOY_FOLDER/backend/" 2>/dev/null || true
cp backend/package.json "$DEPLOY_FOLDER/backend/" 2>/dev/null || true
cp backend/package-lock.json "$DEPLOY_FOLDER/backend/" 2>/dev/null || true
cp backend/tsconfig.json "$DEPLOY_FOLDER/backend/" 2>/dev/null || true

for folder in routes config middleware uploads; do
    if [ -d "backend/$folder" ]; then
        cp -r "backend/$folder" "$DEPLOY_FOLDER/backend/"
    fi
done

if [ -f "backend/.env.production" ]; then
    cp backend/.env.production "$DEPLOY_FOLDER/backend/.env"
    echo "   ✓ Arquivo .env de produção copiado"
    echo "   ⚠️  LEMBRE-SE: Configure as variáveis do Firebase no .env!"
else
    echo "   ⚠️  Atenção: .env.production não encontrado!"
fi

echo ""
echo "🎨 Preparando Frontend..."

if [ ! -f "frontend/.env.production" ]; then
    echo "   ❌ Erro: frontend/.env.production não encontrado!"
    echo "   Configure o arquivo .env.production antes de continuar."
    exit 1
fi

echo "   - Verificando configurações do Firebase..."
if grep -q "AIzaSy\.\.\." "frontend/.env.production"; then
    echo "   ⚠️  ATENÇÃO: Configure as credenciais reais do Firebase em frontend/.env.production"
    read -p "   Deseja continuar mesmo assim? (s/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "   ❌ Deploy cancelado. Configure o Firebase e tente novamente."
        exit 1
    fi
fi

echo "   - Fazendo build do frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "   - Instalando dependências do frontend..."
    npm install
fi

echo "   - Executando build de produção..."
npm run build

if [ ! -d "dist" ]; then
    echo "   ❌ Erro: Build falhou! Pasta dist não foi criada."
    cd ..
    exit 1
fi

echo "   - Copiando arquivos do build..."
cp -r dist/* "../$DEPLOY_FOLDER/frontend-dist/"
cd ..

echo "   ✓ Build do frontend concluído"

echo ""
echo "📝 Criando arquivos de configuração..."

cat > "$DEPLOY_FOLDER/.gitignore" << 'EOF'
.env
node_modules/
*.log
.DS_Store
EOF

echo "   ✓ Arquivos de configuração criados"

echo ""
echo "======================================================================"
echo "✅ Preparação concluída com sucesso!"
echo "======================================================================"
echo ""
echo "📦 Pasta pronta para deploy: $DEPLOY_FOLDER"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. ANTES DE ENVIAR para o servidor:"
echo "   - Edite: $DEPLOY_FOLDER/backend/.env"
echo "   - Configure as credenciais do Firebase"
echo "   - Configure o JWT_SECRET (use: openssl rand -base64 32)"
echo ""
echo "2. ENVIAR para o servidor via SSH/SCP:"
echo "   scp -r $DEPLOY_FOLDER/backend/ user@31.97.255.226:/var/www/site-adm-app/"
echo "   scp -r $DEPLOY_FOLDER/frontend-dist/ user@31.97.255.226:/var/www/site-adm-app/"
echo ""
echo "3. NO SERVIDOR, execute:"
echo "   cd /var/www/site-adm-app/backend"
echo "   npm install --production"
echo "   pm2 start ecosystem.config.js"
echo ""
echo "4. Configure o NGINX (veja: DEPLOY_VPS_COMPLETO.md)"
echo ""
echo "Leia o guia completo em: DEPLOY_VPS_COMPLETO.md"
echo ""

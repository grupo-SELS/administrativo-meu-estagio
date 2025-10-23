#!/bin/bash
# ===============================================
# BUILD NO SERVIDOR - Script Completo
# ===============================================
# Execute no servidor após enviar o código fonte
# Uso: bash build-no-servidor.sh
# ===============================================

set -e  # Sair em caso de erro

echo "🚀 Iniciando build no servidor..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está na pasta correta
if [ ! -d "./frontend" ] || [ ! -d "./backend" ]; then
    echo -e "${RED}❌ Erro: Execute este script na pasta /var/www/site-adm-app/${NC}"
    exit 1
fi

# ===============================================
# FRONTEND - BUILD
# ===============================================
echo -e "${YELLOW}📦 Buildando Frontend...${NC}"
cd frontend

# Verificar se package.json existe
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado!${NC}"
    exit 1
fi

# Instalar dependências
echo "   - Instalando dependências do frontend..."
npm install

# Verificar se .env.production existe
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  Atenção: .env.production não encontrado!${NC}"
    echo "   Usando variáveis padrão..."
fi

# Build de produção
echo "   - Executando build de produção..."
npm run build

# Verificar se build foi criado
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Erro: Build falhou! Pasta dist não foi criada.${NC}"
    exit 1
fi

# Copiar build para pasta de produção
echo "   - Copiando build para pasta de produção..."
cd ..
rm -rf frontend-dist
mkdir -p frontend-dist
cp -r frontend/dist/* frontend-dist/

echo -e "${GREEN}✅ Frontend buildado com sucesso!${NC}"
echo ""

# ===============================================
# BACKEND - CONFIGURAÇÃO
# ===============================================
echo -e "${YELLOW}⚙️  Configurando Backend...${NC}"
cd backend

# Verificar se package.json existe
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado!${NC}"
    exit 1
fi

# Instalar dependências de produção
echo "   - Instalando dependências de produção..."
npm install --production

# Criar pasta uploads se não existir
if [ ! -d "uploads" ]; then
    echo "   - Criando pasta uploads..."
    mkdir -p uploads
    chmod 755 uploads
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Atenção: .env não encontrado!${NC}"
    
    if [ -f ".env.production" ]; then
        echo "   - Copiando .env.production para .env..."
        cp .env.production .env
    else
        echo -e "${RED}❌ Erro: Nenhum arquivo .env encontrado!${NC}"
        echo "   Configure o .env antes de continuar."
        exit 1
    fi
fi

echo -e "${GREEN}✅ Backend configurado com sucesso!${NC}"
echo ""

# ===============================================
# PM2 - INICIAR/REINICIAR
# ===============================================
echo -e "${YELLOW}🔄 Gerenciando processo PM2...${NC}"

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2 não está instalado!${NC}"
    echo "   Instale com: npm install -g pm2"
    exit 1
fi

# Verificar se ecosystem.config.js existe
if [ ! -f "ecosystem.config.js" ]; then
    echo -e "${YELLOW}⚠️  ecosystem.config.js não encontrado!${NC}"
    echo "   Iniciando com ts-node diretamente..."
    pm2 start server.ts --name site-adm-estagio-backend --interpreter ts-node
else
    # Verificar se app já está rodando
    if pm2 list | grep -q "site-adm-estagio-backend"; then
        echo "   - Reiniciando aplicação existente..."
        pm2 restart site-adm-estagio-backend
    else
        echo "   - Iniciando nova aplicação..."
        pm2 start ecosystem.config.js
    fi
fi

# Salvar configuração PM2
pm2 save

echo -e "${GREEN}✅ Processo PM2 iniciado!${NC}"
echo ""

# ===============================================
# NGINX - RECARREGAR
# ===============================================
echo -e "${YELLOW}🌐 Recarregando Nginx...${NC}"

# Verificar se Nginx está instalado
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}⚠️  Nginx não está instalado (ainda)${NC}"
else
    # Testar configuração
    if nginx -t &> /dev/null; then
        systemctl reload nginx
        echo -e "${GREEN}✅ Nginx recarregado!${NC}"
    else
        echo -e "${YELLOW}⚠️  Configuração do Nginx tem erros${NC}"
        echo "   Execute: nginx -t para ver os erros"
    fi
fi

echo ""

# ===============================================
# VERIFICAÇÃO
# ===============================================
echo -e "${YELLOW}🔍 Verificando serviços...${NC}"
echo ""

# Backend
echo "Backend (PM2):"
pm2 list | grep site-adm-estagio-backend || echo "   ⚠️  Backend não encontrado"
echo ""

# Frontend
echo "Frontend:"
if [ -d "../frontend-dist" ] && [ "$(ls -A ../frontend-dist)" ]; then
    echo -e "   ${GREEN}✅ Build do frontend pronto${NC}"
    echo "   Arquivos: $(ls -1 ../frontend-dist | wc -l)"
else
    echo -e "   ${RED}❌ Pasta frontend-dist vazia${NC}"
fi
echo ""

# Nginx
echo "Nginx:"
if systemctl is-active --quiet nginx; then
    echo -e "   ${GREEN}✅ Nginx rodando${NC}"
else
    echo -e "   ${RED}❌ Nginx não está rodando${NC}"
fi
echo ""

# ===============================================
# RESUMO
# ===============================================
echo "======================================================================"
echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
echo "======================================================================"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Verifique os logs do backend:"
echo "   pm2 logs site-adm-estagio-backend"
echo ""
echo "2. Teste o site:"
echo "   curl http://localhost:3001/health"
echo "   curl http://localhost"
echo ""
echo "3. Configure Nginx se ainda não fez:"
echo "   Veja o guia: DEPLOY_VPS_COMPLETO.md"
echo ""
echo "4. Configure SSL/HTTPS:"
echo "   sudo certbot --nginx -d meuestagio.chattec.com.br"
echo ""
echo "======================================================================"

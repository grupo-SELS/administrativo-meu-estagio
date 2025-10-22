#!/bin/bash
# Script para iniciar o backend do sistema

echo "🚀 Iniciando servidor backend..."
echo "📁 Navegando para pasta backend..."

cd backend

echo "📦 Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependências..."
    npm install
fi

echo "▶️  Iniciando servidor em modo desenvolvimento..."
npm run dev

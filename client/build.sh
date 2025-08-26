#!/bin/bash
echo "🚀 Iniciando build do GymConnect..."

echo "📦 Instalando dependências do frontend..."
npm install

echo "🔧 Instalando dependências do backend..."
npm install pg bcryptjs jsonwebtoken

echo "🔨 Executando build..."
npm run build

echo "✅ Build concluído!"

#!/bin/bash

echo "🚀 Iniciando build do GymConnect..."

# Navegar para o diretório client
cd client

echo "📦 Instalando dependências..."
npm install

echo "🔨 Executando build..."
npm run build

echo "✅ Build concluído!"

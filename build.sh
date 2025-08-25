#!/bin/bash

set -e  # Exit on any error

echo "🚀 Iniciando build do GymConnect..."

# Verificar se estamos no diretório correto
echo "📁 Diretório atual: $(pwd)"
echo "📁 Conteúdo do diretório:"
ls -la

# Navegar para o diretório client
echo "📂 Navegando para o diretório client..."
cd client

echo "📁 Diretório client: $(pwd)"
echo "📁 Conteúdo do client:"
ls -la

echo "📦 Instalando dependências..."
npm install

echo "📋 Verificando package.json..."
cat package.json

echo "🔨 Executando build..."
npm run build

echo "📁 Verificando se o build foi criado..."
ls -la build/

echo "✅ Build concluído com sucesso!"
echo "📁 Conteúdo do diretório build:"
ls -la build/

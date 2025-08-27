#!/bin/bash

# Script de Deploy para Produção - GymConnect
# Este script garante que o backend esteja funcionando antes de servir o frontend

set -e  # Para o script se houver qualquer erro

echo "🚀 Iniciando deploy para produção..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    error "Node.js não está instalado"
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    error "npm não está instalado"
    exit 1
fi

# Verificar se o PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    warn "PM2 não está instalado. Instalando..."
    npm install -g pm2
fi

log "Verificando dependências..."

# Instalar dependências do servidor
if [ ! -d "node_modules" ]; then
    log "Instalando dependências do servidor..."
    npm install
else
    log "Atualizando dependências do servidor..."
    npm update
fi

# Verificar se o diretório client existe
if [ ! -d "client" ]; then
    error "Diretório 'client' não encontrado"
    exit 1
fi

# Instalar dependências do cliente
log "Instalando dependências do cliente..."
cd client
if [ ! -d "node_modules" ]; then
    npm install
else
    npm update
fi

# Build do cliente para produção
log "Fazendo build do cliente para produção..."
npm run build

# Verificar se o build foi bem-sucedido
if [ ! -d "build" ]; then
    error "Build do cliente falhou"
    exit 1
fi

log "Build do cliente concluído com sucesso!"

# Voltar para o diretório raiz
cd ..

# Criar diretório de logs se não existir
mkdir -p logs

# Parar processos PM2 existentes
log "Parando processos PM2 existentes..."
pm2 stop gymconnect-production 2>/dev/null || true
pm2 delete gymconnect-production 2>/dev/null || true

# Iniciar o servidor de produção
log "Iniciando servidor de produção..."
pm2 start ecosystem.config.js --env production

# Aguardar o servidor estar pronto
log "Aguardando servidor estar pronto..."
sleep 5

# Verificar se o servidor está respondendo
log "Verificando se o servidor está respondendo..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        log "✅ Servidor está respondendo!"
        break
    fi
    
    attempt=$((attempt + 1))
    echo -n "."
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    error "❌ Servidor não respondeu em 30 segundos"
    log "Verificando logs..."
    pm2 logs gymconnect-production --lines 20
    exit 1
fi

# Verificar status do PM2
log "Verificando status do PM2..."
pm2 status

# Salvar configuração do PM2
log "Salvando configuração do PM2..."
pm2 save

# Configurar startup automático
log "Configurando startup automático..."
pm2 startup

log "🎉 Deploy para produção concluído com sucesso!"
log "📱 Frontend: http://localhost:3001"
log "🔧 Backend: http://localhost:3001/api/health"
log "📊 Monitoramento: pm2 monit"

# Mostrar informações úteis
echo ""
echo "📋 Comandos úteis:"
echo "  pm2 status                    - Ver status dos processos"
echo "  pm2 logs gymconnect-production - Ver logs em tempo real"
echo "  pm2 monit                     - Monitoramento interativo"
echo "  pm2 restart gymconnect-production - Reiniciar aplicação"
echo "  pm2 stop gymconnect-production   - Parar aplicação"
echo ""

# Verificar se há variáveis de ambiente importantes
if [ -z "$JWT_SECRET" ]; then
    warn "JWT_SECRET não está definido. Usando valor padrão."
fi

if [ -z "$NODE_ENV" ]; then
    warn "NODE_ENV não está definido. Usando 'production'."
fi

log "✅ Sistema pronto para produção!"

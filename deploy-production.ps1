# Script de Deploy para Produção - GymConnect (PowerShell)
# Este script garante que o backend esteja funcionando antes de servir o frontend

param(
    [switch]$Force,
    [string]$Environment = "production"
)

# Configurações
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Funções de log colorido
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "Blue" }
    }
    
    Write-Host "[$timestamp] $Message" -ForegroundColor $color
}

function Write-Success { param([string]$Message) Write-Log $Message "SUCCESS" }
function Write-Warn { param([string]$Message) Write-Log $Message "WARN" }
function Write-Error { param([string]$Message) Write-Log $Message "ERROR" }

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Error "Execute este script no diretório raiz do projeto"
    exit 1
}

Write-Success "🚀 Iniciando deploy para produção..."

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Success "Node.js encontrado: $nodeVersion"
} catch {
    Write-Error "Node.js não está instalado"
    exit 1
}

# Verificar se o npm está instalado
try {
    $npmVersion = npm --version
    Write-Success "npm encontrado: $npmVersion"
} catch {
    Write-Error "npm não está instalado"
    exit 1
}

# Verificar se o PM2 está instalado
try {
    $pm2Version = pm2 --version
    Write-Success "PM2 encontrado: $pm2Version"
} catch {
    Write-Warn "PM2 não está instalado. Instalando..."
    npm install -g pm2
}

Write-Success "Verificando dependências..."

# Instalar/atualizar dependências do servidor
if (-not (Test-Path "node_modules")) {
    Write-Success "Instalando dependências do servidor..."
    npm install
} else {
    Write-Success "Atualizando dependências do servidor..."
    npm update
}

# Verificar se o diretório client existe
if (-not (Test-Path "client")) {
    Write-Error "Diretório 'client' não encontrado"
    exit 1
}

# Instalar dependências do cliente
Write-Success "Instalando dependências do cliente..."
Set-Location client

if (-not (Test-Path "node_modules")) {
    npm install
} else {
    npm update
}

# Build do cliente para produção
Write-Success "Fazendo build do cliente para produção..."
npm run build

# Verificar se o build foi bem-sucedido
if (-not (Test-Path "build")) {
    Write-Error "Build do cliente falhou"
    exit 1
}

Write-Success "Build do cliente concluído com sucesso!"

# Voltar para o diretório raiz
Set-Location ..

# Criar diretório de logs se não existir
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" -Force | Out-Null
}

# Parar processos PM2 existentes
Write-Success "Parando processos PM2 existentes..."
try {
    pm2 stop gymconnect-production 2>$null
    pm2 delete gymconnect-production 2>$null
} catch {
    # Ignorar erros se não existir
}

# Iniciar o servidor de produção
Write-Success "Iniciando servidor de produção..."
pm2 start ecosystem.config.js --env $Environment

# Aguardar o servidor estar pronto
Write-Success "Aguardando servidor estar pronto..."
Start-Sleep -Seconds 5

# Verificar se o servidor está respondendo
Write-Success "Verificando se o servidor está respondendo..."
$maxAttempts = 30
$attempt = 0

while ($attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method GET -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Success "✅ Servidor está respondendo!"
            break
        }
    } catch {
        # Ignorar erros de timeout
    }
    
    $attempt++
    Write-Host "." -NoNewline
    Start-Sleep -Seconds 1
}

if ($attempt -eq $maxAttempts) {
    Write-Error "❌ Servidor não respondeu em 30 segundos"
    Write-Success "Verificando logs..."
    pm2 logs gymconnect-production --lines 20
    exit 1
}

Write-Host ""

# Verificar status do PM2
Write-Success "Verificando status do PM2..."
pm2 status

# Salvar configuração do PM2
Write-Success "Salvando configuração do PM2..."
pm2 save

# Configurar startup automático
Write-Success "Configurando startup automático..."
pm2 startup

Write-Success "🎉 Deploy para produção concluído com sucesso!"
Write-Success "📱 Frontend: http://localhost:3001"
Write-Success "🔧 Backend: http://localhost:3001/api/health"
Write-Success "📊 Monitoramento: pm2 monit"

# Mostrar informações úteis
Write-Host ""
Write-Host "📋 Comandos úteis:" -ForegroundColor Cyan
Write-Host "  pm2 status                    - Ver status dos processos"
Write-Host "  pm2 logs gymconnect-production - Ver logs em tempo real"
Write-Host "  pm2 monit                     - Monitoramento interativo"
Write-Host "  pm2 restart gymconnect-production - Reiniciar aplicação"
Write-Host "  pm2 stop gymconnect-production   - Parar aplicação"
Write-Host ""

# Verificar se há variáveis de ambiente importantes
if (-not $env:JWT_SECRET) {
    Write-Warn "JWT_SECRET não está definido. Usando valor padrão."
}

if (-not $env:NODE_ENV) {
    Write-Warn "NODE_ENV não está definido. Usando '$Environment'."
}

Write-Success "✅ Sistema pronto para produção!"

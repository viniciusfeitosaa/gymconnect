# 🚀 Deploy para Produção - GymConnect

Este documento explica como fazer o deploy da aplicação GymConnect para produção de forma segura e confiável.

## 📋 Pré-requisitos

- ✅ Node.js 18+ instalado
- ✅ npm ou yarn instalado
- ✅ PM2 instalado globalmente (`npm install -g pm2`)
- ✅ Git configurado (para deploy automático)

## 🔧 Scripts Disponíveis

### **Desenvolvimento**
```bash
# Desenvolvimento com backend e frontend simultâneos
npm run dev:full

# Desenvolvimento sequencial (recomendado)
npm run dev:wait

# Apenas backend
npm run dev

# Apenas frontend
npm run client
```

### **Produção**
```bash
# Build do frontend
npm run build

# Iniciar servidor de produção
npm run start:production

# Build completo + produção
npm run build:full
```

## 🚀 Deploy Automático

### **Linux/macOS**
```bash
# Dar permissão de execução
chmod +x deploy-production.sh

# Executar deploy
./deploy-production.sh
```

### **Windows (PowerShell)**
```powershell
# Executar como administrador
.\deploy-production.ps1

# Com parâmetros
.\deploy-production.ps1 -Environment production -Force
```

## 📁 Estrutura de Arquivos de Produção

```
GymConnect/
├── start-production.js      # Servidor de produção otimizado
├── ecosystem.config.js      # Configuração PM2
├── deploy-production.sh     # Script de deploy (Linux/macOS)
├── deploy-production.ps1    # Script de deploy (Windows)
├── logs/                    # Diretório de logs
├── client/build/            # Frontend buildado
└── package.json            # Dependências e scripts
```

## 🔍 Características do Servidor de Produção

### **✅ Verificação de Backend**
- Aguarda o backend estar funcionando antes de servir o frontend
- Health check automático na rota `/api/health`
- Timeout configurável (30 segundos padrão)

### **✅ Tratamento de Erros Robusto**
- Try-catch em todas as rotas
- Logs estruturados para produção
- Graceful shutdown com SIGTERM/SIGINT

### **✅ Monitoramento e Logs**
- Logs com timestamp e IP do cliente
- Rota de health check detalhada
- Monitoramento PM2 integrado

### **✅ Segurança**
- CORS configurado
- JWT com expiração configurável
- Validação de entrada em todas as rotas

## 📊 Monitoramento com PM2

### **Comandos Básicos**
```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs gymconnect-production

# Monitoramento interativo
pm2 monit

# Reiniciar aplicação
pm2 restart gymconnect-production

# Parar aplicação
pm2 stop gymconnect-production
```

### **Configurações PM2**
- **Auto-restart**: Sim
- **Watch mode**: Não (produção)
- **Memory limit**: 1GB
- **Instâncias**: 1 (pode ser aumentado)
- **Logs**: Rotacionados automaticamente

## 🌍 Variáveis de Ambiente

### **Obrigatórias**
```bash
NODE_ENV=production
PORT=3001
```

### **Opcionais**
```bash
JWT_SECRET=sua-chave-secreta-aqui
```

### **Configuração**
```bash
# Linux/macOS
export NODE_ENV=production
export JWT_SECRET=sua-chave-secreta

# Windows
set NODE_ENV=production
set JWT_SECRET=sua-chave-secreta
```

## 🔄 Processo de Deploy

### **1. Preparação**
```bash
# Atualizar código
git pull origin main

# Instalar dependências
npm install
cd client && npm install && cd ..
```

### **2. Build**
```bash
# Build do frontend
npm run build

# Verificar build
ls -la client/build/
```

### **3. Deploy**
```bash
# Executar script de deploy
./deploy-production.sh

# Ou manualmente
pm2 start ecosystem.config.js --env production
```

### **4. Verificação**
```bash
# Verificar status
pm2 status

# Testar endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/test
```

## 🚨 Troubleshooting

### **Problema: Porta já em uso**
```bash
# Verificar processos
netstat -tulpn | grep :3001

# Parar processos
pm2 stop all
pm2 delete all
```

### **Problema: Backend não responde**
```bash
# Verificar logs
pm2 logs gymconnect-production

# Reiniciar
pm2 restart gymconnect-production
```

### **Problema: Frontend não carrega**
```bash
# Verificar build
ls -la client/build/

# Verificar logs do servidor
pm2 logs gymconnect-production
```

## 📈 Monitoramento e Alertas

### **Health Checks**
- **Endpoint**: `/api/health`
- **Frequência**: A cada 30 segundos
- **Timeout**: 10 segundos

### **Métricas Disponíveis**
- Uptime do servidor
- Uso de memória
- Status das rotas
- Tempo de resposta

### **Logs Estruturados**
- Timestamp ISO
- Método HTTP
- Rota acessada
- IP do cliente
- Status da resposta

## 🔒 Segurança

### **Headers de Segurança**
- CORS configurado
- Content-Type validation
- JWT authentication

### **Rate Limiting**
- Implementar se necessário
- Configurável por rota

### **Validação de Entrada**
- Sanitização de dados
- Validação de tipos
- Proteção contra SQL injection

## 📞 Suporte

### **Logs de Debug**
```bash
# Ver logs detalhados
pm2 logs gymconnect-production --lines 100

# Filtrar por erro
pm2 logs gymconnect-production | grep ERROR
```

### **Testes de Conectividade**
```bash
# Testar backend
curl -v http://localhost:3001/api/health

# Testar frontend
curl -v http://localhost:3001/
```

## 🎯 Próximos Passos

1. **Configurar CI/CD** com GitHub Actions
2. **Implementar backup automático** dos dados
3. **Adicionar métricas** com Prometheus
4. **Configurar alertas** com Slack/Email
5. **Implementar rate limiting** para APIs públicas

---

**✅ Sistema pronto para produção com zero downtime e restart automático!**

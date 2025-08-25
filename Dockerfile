# Multi-stage build para otimizar o tamanho da imagem
FROM node:18-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache python3 make g++

# Estágio de dependências
FROM base AS deps
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm ci --only=production && npm cache clean --force

# Estágio de build do cliente
FROM base AS client-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY client/ ./client/
WORKDIR /app/client
RUN npm ci && npm run build

# Estágio de produção
FROM base AS production
WORKDIR /app

# Criar diretório de logs
RUN mkdir -p logs

# Copiar dependências do servidor
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY server/ ./server/

# Copiar build do cliente
COPY --from=client-builder /app/client/build ./client/build

# Configurar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/auth/me', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Expor porta
EXPOSE 5000

# Comando para iniciar
CMD ["node", "server/index.js"]

# 🚀 Deploy no Netlify - GymConnect

Este guia explica como fazer o deploy da aplicação GymConnect no Netlify com Netlify Functions.

## 📋 Pré-requisitos

- ✅ Conta no [Netlify](https://netlify.com) (gratuita)
- ✅ Git configurado no projeto
- ✅ Node.js 18+ instalado
- ✅ npm ou yarn instalado

## 🔧 Configuração Local

### **1. Instalar Netlify CLI**
```bash
npm install -g netlify-cli
```

### **2. Fazer login no Netlify**
```bash
netlify login
```

### **3. Verificar configuração**
```bash
netlify status
```

## 🏗️ Estrutura do Projeto para Netlify

```
GymConnect/
├── client/                     # Frontend React
│   ├── src/
│   ├── build/                 # Build de produção
│   └── package.json
├── netlify/                   # Funções Netlify
│   └── functions/
│       └── api.js            # API principal
├── netlify.toml              # Configuração Netlify
└── package.json
```

## 🚀 Deploy Automático

### **Opção 1: Deploy via Git (Recomendado)**

1. **Conectar repositório no Netlify:**
   - Acesse [app.netlify.com](https://app.netlify.com)
   - Clique em "New site from Git"
   - Escolha seu provedor (GitHub, GitLab, Bitbucket)
   - Selecione o repositório `GymConnect`

2. **Configurar build settings:**
   ```
   Build command: cd client && npm install && npm run build
   Publish directory: client/build
   Functions directory: netlify/functions
   ```

3. **Configurar variáveis de ambiente:**
   ```
   NODE_ENV = production
   JWT_SECRET = sua-chave-secreta-aqui
   ```

4. **Deploy automático:**
   - A cada push para `main`, o Netlify fará deploy automático
   - O build será executado e as funções serão deployadas

### **Opção 2: Deploy Manual via CLI**

1. **Build do frontend:**
   ```bash
   cd client
   npm run build
   cd ..
   ```

2. **Deploy via CLI:**
   ```bash
   netlify deploy --prod --dir=client/build --functions=netlify/functions
   ```

3. **Configurar funções:**
   ```bash
   netlify functions:deploy
   ```

## 🔍 Testando o Deploy

### **1. Verificar frontend:**
- Acesse a URL fornecida pelo Netlify
- Verifique se a interface carrega corretamente

### **2. Testar API:**
```bash
# Health check
curl https://your-app.netlify.app/.netlify/functions/api/test

# Health detalhado
curl https://your-app.netlify.app/.netlify/functions/api/health
```

### **3. Testar registro:**
```bash
curl -X POST https://your-app.netlify.app/.netlify/functions/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste Netlify","email":"teste@netlify.com","password":"Teste123!"}'
```

## ⚙️ Configurações Avançadas

### **1. Domínio personalizado:**
- No dashboard do Netlify, vá em "Domain settings"
- Adicione seu domínio personalizado
- Configure DNS conforme instruções

### **2. HTTPS automático:**
- O Netlify fornece HTTPS automático
- Certificados SSL são gerenciados automaticamente

### **3. Branch Deploy:**
- Configure branches específicos para deploy
- Útil para staging e preview

### **4. Formulários:**
- Se implementar formulários, o Netlify captura automaticamente
- Acesse "Forms" no dashboard para ver submissões

## 🚨 Troubleshooting

### **Problema: Build falha**
```bash
# Verificar logs
netlify build --debug

# Verificar dependências
cd client && npm install
```

### **Problema: Funções não funcionam**
```bash
# Verificar logs das funções
netlify functions:logs

# Testar localmente
netlify dev
```

### **Problema: CORS errors**
- Verificar se `netlify.toml` está configurado corretamente
- Verificar headers nas funções

### **Problema: Frontend não carrega**
- Verificar se `netlify.toml` tem redirecionamentos corretos
- Verificar se build foi bem-sucedido

## 📊 Monitoramento

### **1. Logs em tempo real:**
```bash
netlify functions:logs --tail
```

### **2. Métricas no dashboard:**
- **Analytics**: Tráfego e performance
- **Functions**: Uso e erros das funções
- **Forms**: Submissões de formulários

### **3. Alertas:**
- Configure notificações para falhas de build
- Configure alertas para erros de função

## 🔒 Segurança

### **1. Variáveis de ambiente:**
- Nunca commite `.env` files
- Use variáveis de ambiente do Netlify
- Rotacione JWT_SECRET regularmente

### **2. Headers de segurança:**
- O `netlify.toml` já inclui headers básicos
- Configure headers adicionais se necessário

### **3. Rate limiting:**
- Implemente rate limiting nas funções se necessário
- Use Netlify Edge Functions para casos avançados

## 🎯 Próximos Passos

1. **Implementar banco de dados persistente** (Neon, Supabase)
2. **Adicionar autenticação social** (Google, Facebook)
3. **Implementar upload de arquivos** (Netlify Large Media)
4. **Configurar CDN** para assets estáticos
5. **Implementar cache** com Netlify Edge Functions

## 📞 Suporte

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Netlify Functions**: [docs.netlify.com/functions](https://docs.netlify.com/functions)
- **Netlify CLI**: [docs.netlify.com/cli](https://docs.netlify.com/cli)
- **Issues**: Abra uma issue no repositório

---

**🎉 Parabéns! Seu GymConnect está rodando no Netlify com zero configuração de servidor!**

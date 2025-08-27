# 🧪 Testando a API do GymConnect no Netlify

## 🔍 **Diagnóstico do Problema:**

O frontend está funcionando, mas o backend (Netlify Functions) não está respondendo. Vamos testar passo a passo.

## 📋 **Passos para Testar:**

### **1. Testar a função de teste simples:**
```bash
# Substitua YOUR_SITE_URL pela URL do seu site no Netlify
curl https://YOUR_SITE_URL.netlify.app/.netlify/functions/test
```

**Resposta esperada:**
```json
{
  "message": "Teste funcionando!",
  "timestamp": "2024-01-27T...",
  "method": "GET",
  "path": "/.netlify/functions/test"
}
```

### **2. Testar a função principal da API:**
```bash
# Health check básico
curl https://YOUR_SITE_URL.netlify.app/.netlify/functions/api/test

# Health check detalhado
curl https://YOUR_SITE_URL.netlify.app/.netlify/functions/api/health
```

**Resposta esperada para `/test`:**
```json
{
  "message": "Backend funcionando no Netlify!",
  "timestamp": "2024-01-27T...",
  "environment": "production"
}
```

### **3. Testar registro de usuário:**
```bash
curl -X POST https://YOUR_SITE_URL.netlify.app/.netlify/functions/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Netlify",
    "email": "teste@netlify.com",
    "password": "Teste123!"
  }'
```

## 🚨 **Se os testes falharem:**

### **Problema 1: Função não encontrada (404)**
- Verificar se o deploy foi bem-sucedido
- Verificar se as funções estão na pasta correta
- Verificar logs do Netlify

### **Problema 2: Erro interno (500)**
- Verificar logs das funções no Netlify
- Verificar se as dependências estão instaladas
- Verificar se há erros de sintaxe

### **Problema 3: CORS errors**
- Verificar se os headers estão corretos
- Verificar se o frontend está chamando a URL correta

## 🔧 **Soluções Comuns:**

### **1. Verificar logs das funções:**
```bash
# No dashboard do Netlify
Site settings → Functions → Logs
```

### **2. Verificar variáveis de ambiente:**
```bash
# No dashboard do Netlify
Site settings → Environment variables
```

**Variáveis necessárias:**
```
JWT_SECRET = sua-chave-secreta-aqui
NODE_ENV = production
```

### **3. Verificar se a função está sendo chamada:**
- Abrir DevTools do navegador
- Verificar Network tab
- Ver se as requisições estão indo para a URL correta

## 📱 **Testando no Frontend:**

### **1. Abrir o console do navegador:**
```javascript
// Testar se a API está funcionando
fetch('/.netlify/functions/api/test')
  .then(response => response.json())
  .then(data => console.log('API Response:', data))
  .catch(error => console.error('API Error:', error));
```

### **2. Verificar se o AuthContext está usando a URL correta:**
- Verificar se `API_BASE_URL` está correto
- Verificar se as requisições estão indo para `/api/...` ou `/.netlify/functions/api/...`

## 🎯 **Próximos Passos:**

1. **Execute os testes acima**
2. **Verifique os logs do Netlify**
3. **Teste no frontend**
4. **Reporte os resultados** para podermos diagnosticar melhor

---

**💡 Dica:** Se nada funcionar, pode ser necessário fazer um novo deploy ou verificar se há problemas na configuração do Netlify.

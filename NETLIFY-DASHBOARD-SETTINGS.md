# ⚙️ Configurações do Dashboard Netlify

## 🚨 **IMPORTANTE: Remover configurações do Dashboard**

Para evitar conflitos com o `netlify.toml`, **remova** todas as configurações manuais do dashboard do Netlify:

### **1. Build Settings - DEIXAR VAZIO:**
- ❌ **Build command**: Deixar vazio (será usado do netlify.toml)
- ❌ **Publish directory**: Deixar vazio (será usado do netlify.toml)
- ❌ **Functions directory**: Deixar vazio (será usado do netlify.toml)

### **2. Environment Variables - CONFIGURAR:**
```
NODE_ENV = production
JWT_SECRET = sua-chave-secreta-aqui
```

## 🔧 **Configuração Atual no netlify.toml:**

```toml
[build]
  command = "cd client && npm install && npm run build"
  publish = "client/build"
  functions = "netlify/functions"
```

## 📋 **Passos para Corrigir:**

### **Passo 1: Limpar Dashboard**
1. Acesse [app.netlify.com](https://app.netlify.com)
2. Vá em seu site → **Site settings** → **Build & deploy**
3. Em **Build settings**, clique em **Edit settings**
4. **Remova** todos os valores:
   - Build command: `[VAZIO]`
   - Publish directory: `[VAZIO]`
   - Functions directory: `[VAZIO]`
5. Clique em **Save**

### **Passo 2: Configurar Variáveis de Ambiente**
1. Vá em **Environment variables**
2. Adicione:
   ```
   NODE_ENV = production
   JWT_SECRET = sua-chave-secreta-aqui
   ```

### **Passo 3: Trigger Deploy**
1. Vá em **Deploys**
2. Clique em **Trigger deploy** → **Deploy site**
3. O Netlify usará automaticamente o `netlify.toml`

## ✅ **Resultado Esperado:**

Após a correção, o deploy deve mostrar:
```
Build command: cd client && npm install && npm run build
Publish directory: client/build
Functions directory: netlify/functions
```

## 🚨 **Se ainda houver problemas:**

### **Opção 1: Deletar e recriar o site**
1. Delete o site atual no Netlify
2. Crie um novo site conectando ao GitHub
3. **NÃO configure nada no dashboard**
4. Deixe o `netlify.toml` fazer todo o trabalho

### **Opção 2: Deploy via CLI**
```bash
# Fazer login
netlify login

# Deploy direto
netlify deploy --prod --dir=client/build --functions=netlify/functions
```

## 📞 **Suporte:**

- **Netlify Status**: [status.netlify.com](https://status.netlify.com)
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Issues**: Abra uma issue no repositório

---

**🎯 Lembre-se: O `netlify.toml` deve ser a única fonte de configuração!**

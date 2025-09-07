# Credenciais do Mercado Pago - GymConnect

## 🔑 Suas Credenciais de Teste

### Public Key (Frontend)

```
TEST-9a12457f-d709-4400-8ec4-354ae5e0ace1
```

### Access Token (Backend)

```
TEST-2198038357846606-090713-a4135a2248b13fb50d5bb72ff4672237-810345213
```

## 📝 Como Configurar

### 1. Criar arquivo `.env.local` na pasta `client/`

Crie um arquivo `.env.local` na pasta `client/` com o seguinte conteúdo:

```env
# Mercado Pago - Credenciais de Teste
REACT_APP_MERCADOPAGO_PUBLIC_KEY=TEST-9a12457f-d709-4400-8ec4-354ae5e0ace1
REACT_APP_MERCADOPAGO_ACCESS_TOKEN=TEST-2198038357846606-090713-a4135a2248b13fb50d5bb72ff4672237-810345213

# URLs da API
REACT_APP_API_URL=http://localhost:5000
```

### 2. Configurar no Backend

No seu backend (pasta `server/`), crie um arquivo `.env` com:

```env
# Mercado Pago - Backend
MERCADOPAGO_ACCESS_TOKEN=TEST-2198038357846606-090713-a4135a2248b13fb50d5bb72ff4672237-810345213
MERCADOPAGO_PUBLIC_KEY=TEST-9a12457f-d709-4400-8ec4-354ae5e0ace1
```

## 🚀 Próximos Passos

1. **Criar Planos no Mercado Pago Dashboard**
2. **Implementar endpoints da API**
3. **Configurar webhooks**
4. **Testar fluxo completo**

## ⚠️ Importante

- Estas são credenciais de **TESTE**
- Para produção, você precisará de credenciais reais
- Nunca commite credenciais reais no Git
- Use variáveis de ambiente em produção

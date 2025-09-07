# Implementação do Sistema de Assinaturas com Mercado Pago

## 🚀 Visão Geral

Este documento descreve a implementação completa do sistema de **Assinaturas** integrado com **Mercado Pago** para o GymConnect, permitindo que personal trainers paguem mensalmente para ter acesso ao aplicativo.

## 💳 Gateway de Pagamentos: Mercado Pago

### Por que Mercado Pago Assinaturas?

- **✅ PIX Instantâneo** - Muito popular no Brasil
- **✅ Boleto Bancário** - Para quem prefere pagar via boleto
- **✅ Cartões de Crédito/Débito** - Todas as bandeiras
- **✅ Taxas Competitivas** - Especialmente para o Brasil
- **✅ Assinaturas Automáticas** - Cobrança recorrente mensal
- **✅ Webhooks** - Notificações em tempo real
- **✅ Simplicidade** - Foco apenas em assinaturas
- **✅ Gestão Automática** - Renovação e cancelamento automáticos

## 🏗️ Arquitetura Implementada

### 1. **Configuração do Mercado Pago** (`config/mercadopago.ts`)

- Configurações de moeda brasileira (BRL)
- Produtos e preços dos planos
- Configurações de checkout e assinaturas

### 2. **Contexto do Mercado Pago** (`contexts/MercadoPagoContext.tsx`)

- Gerenciamento global do Mercado Pago
- Criação de preferências de pagamento
- Criação de assinaturas
- Portal do cliente

### 3. **Componente de Assinatura** (`SubscriptionCheckout.tsx`)

- Interface moderna focada em assinaturas
- Formulário de cartão otimizado
- Integração com Mercado Pago Assinaturas
- Experiência simplificada e direta
- Foco na conversão de assinaturas

### 4. **Página de Sucesso** (`PaymentSuccess.tsx`)

- Confirmação detalhada do pagamento
- Informações da assinatura
- Próximos passos para o usuário

## 🔧 Configuração Necessária

### 1. **Variáveis de Ambiente**

Crie um arquivo `.env` no diretório `client/`:

```env
# Mercado Pago Configuration
REACT_APP_MERCADOPAGO_PUBLIC_KEY=TEST-your-public-key-here
REACT_APP_MP_BASIC_PLAN_ID=basic_monthly_plan
REACT_APP_MP_PREMIUM_PLAN_ID=premium_monthly_plan

# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

### 2. **Configuração no Mercado Pago Dashboard**

#### Credenciais:

1. **Acesse**: [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. **Crie uma aplicação** para o GymConnect
3. **Obtenha as chaves**:
   - Public Key (para o frontend)
   - Access Token (para o backend)

#### Produtos a Criar:

1. **Plano Básico**

   - Nome: "Plano Básico - GymConnect"
   - Preço: R$ 15,00/mês
   - ID: `basic_monthly_plan`

2. **Plano Premium**
   - Nome: "Plano Premium - GymConnect"
   - Preço: R$ 29,90/mês
   - ID: `premium_monthly_plan`

#### Webhooks a Configurar:

- `payment.created`
- `payment.updated`
- `payment.approved`
- `payment.rejected`
- `subscription.created`
- `subscription.updated`
- `subscription.cancelled`

## 🛠️ Endpoints da API Necessários

### 1. **Criar Preferência de Pagamento**

```http
POST /api/mercadopago/create-preference
Content-Type: application/json
Authorization: Bearer <token>

{
  "planId": "basic",
  "userId": "user123",
  "preference": {
    "items": [...],
    "back_urls": {...},
    "notification_url": "...",
    "external_reference": "user_user123_plan_basic"
  }
}
```

### 2. **Criar Assinatura**

```http
POST /api/mercadopago/create-subscription
Content-Type: application/json
Authorization: Bearer <token>

{
  "planId": "basic",
  "userId": "user123",
  "paymentMethodId": "pm_1234567890",
  "subscription": {
    "plan_id": "basic_monthly_plan",
    "subscriber": {...},
    "payment_method_id": "pm_1234567890"
  }
}
```

### 3. **Portal do Cliente**

```http
POST /api/mercadopago/customer-portal
Content-Type: application/json
Authorization: Bearer <token>
```

### 4. **Webhook Handler**

```http
POST /api/mercadopago/webhook
Content-Type: application/json
X-Signature: <signature>
X-Request-Id: <request-id>

{
  "type": "payment",
  "action": "payment.created",
  "data": {...}
}
```

## 💰 Planos Implementados

### 🆓 **Plano Gratuito**

- **Preço**: R$ 0,00
- **Alunos**: 1 aluno
- **Ativação**: Instantânea
- **Recursos**: Básicos

### ⚡ **Plano Básico**

- **Preço**: R$ 15,00/mês
- **Alunos**: Até 4 alunos
- **Pagamento**: Mercado Pago Checkout Pro
- **Recursos**: Completos

### 👑 **Plano Premium**

- **Preço**: R$ 29,90/mês
- **Alunos**: Ilimitados
- **Pagamento**: Mercado Pago Checkout Pro
- **Recursos**: Avançados

## 🔄 Fluxo de Pagamento

1. **Seleção do Plano** → Usuário escolhe plano pago
2. **Mercado Pago Checkout** → Redirecionamento para checkout seguro
3. **Pagamento** → PIX, cartão ou boleto
4. **Webhook** → Confirmação no backend
5. **Ativação** → Plano ativado automaticamente
6. **Sucesso** → Redirecionamento para página de sucesso

## 🛡️ Segurança

- **Criptografia SSL 256-bit**
- **Conformidade PCI DSS**
- **Dados de pagamento nunca passam pelo servidor**
- **Webhooks assinados para verificação**
- **Tokens JWT para autenticação**

## 📱 Recursos Implementados

### ✅ **Interface de Pagamento**

- Design responsivo e moderno
- Múltiplas opções de pagamento
- Checkout Pro otimizado
- Animações suaves

### ✅ **Métodos de Pagamento**

- **PIX**: Aprovação instantânea
- **Cartão**: Crédito e débito
- **Boleto**: Aprovação em 1 dia útil
- **Transferência**: Bancária

### ✅ **Gerenciamento de Assinaturas**

- Ativação automática
- Renovação mensal
- Portal do cliente
- Cancelamento fácil

### ✅ **Experiência do Usuário**

- Página de sucesso detalhada
- Próximos passos claros
- Suporte integrado
- Feedback visual

## 🚀 Próximos Passos

1. **Configurar Mercado Pago Dashboard**
2. **Implementar endpoints da API**
3. **Configurar webhooks**
4. **Testar fluxo completo**
5. **Deploy em produção**

## 📊 Vantagens do Mercado Pago

### **Para o Negócio:**

- **Taxas competitivas** para o Brasil
- **Alta conversão** com Checkout Pro
- **Suporte local** em português
- **Relatórios detalhados**

### **Para o Usuário:**

- **PIX instantâneo** (muito popular)
- **Boleto bancário** (familiar)
- **Interface confiável** (Mercado Pago)
- **Múltiplas opções** de pagamento

## 📞 Suporte

Para dúvidas sobre a implementação:

- 📧 Email: dev@gymconnect.com
- 📱 WhatsApp: (11) 99999-9999
- 📚 Documentação: [Mercado Pago Docs](https://www.mercadopago.com.br/developers)

---

**Implementado com ❤️ para o GymConnect**

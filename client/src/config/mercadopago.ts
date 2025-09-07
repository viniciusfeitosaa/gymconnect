// Configuração do Mercado Pago - Assinaturas
export const MERCADOPAGO_CONFIG = {
  // Chaves do Mercado Pago (em produção, use variáveis de ambiente)
  publicKey:
    process.env.REACT_APP_MERCADOPAGO_PUBLIC_KEY ||
    'TEST-9a12457f-d709-4400-8ec4-354ae5e0ace1',

  // Configurações de assinatura
  subscription: {
    // Configurações básicas
    currency: 'BRL',
    frequency: 1, // Mensal
    frequencyType: 'months', // Tipo: meses
    trialPeriodDays: 7, // 7 dias de teste gratuito

    // URLs de retorno
    successUrl: `${window.location.origin}/dashboard/plans/success`,
    failureUrl: `${window.location.origin}/dashboard/plans?error=subscription_failed`,
    pendingUrl: `${window.location.origin}/dashboard/plans?status=pending`,

    // Webhook para notificações
    webhookUrl: `${process.env.REACT_APP_API_URL}/webhooks/mercadopago/subscriptions`,
  },

  // Configurações de elementos do Mercado Pago
  elements: {
    // Estilo dos campos de cartão
    cardStyle: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: '"Inter", sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  },
};

// Produtos/Planos do Mercado Pago
export const MERCADOPAGO_PLANS = {
  BASIC: {
    id: 'basic',
    name: 'Plano Básico',
    description: 'Ideal para personal trainers',
    price: 15.0, // R$ 15,00
    maxStudents: 4,
    features: [
      'Até 4 alunos',
      'Treinos ilimitados',
      'Dashboard completo',
      'Relatórios de progresso',
      'Suporte prioritário',
      'Backup automático',
    ],
    // ID do plano no Mercado Pago (será criado via API)
    mpPlanId: process.env.REACT_APP_MP_BASIC_PLAN_ID || 'basic_monthly_plan',
  },
  PREMIUM: {
    id: 'premium',
    name: 'Plano Premium',
    description: 'Para academias e grandes personal trainers',
    price: 29.9, // R$ 29,90
    maxStudents: null, // ilimitado
    features: [
      'Alunos ilimitados',
      'Treinos ilimitados',
      'Dashboard avançado',
      'Relatórios detalhados',
      'Integração com apps',
      'API personalizada',
      'Suporte 24/7',
      'Backup em nuvem',
    ],
    // ID do plano no Mercado Pago (será criado via API)
    mpPlanId:
      process.env.REACT_APP_MP_PREMIUM_PLAN_ID || 'premium_monthly_plan',
  },
};

// Função para formatar preço para o Mercado Pago
export const formatPriceForMP = (price: number): number => {
  return Math.round(price * 100); // Mercado Pago usa centavos
};

// Função para formatar preço do Mercado Pago
export const formatPriceFromMP = (price: number): number => {
  return price / 100; // Converter centavos para reais
};

// Função para criar assinatura no Mercado Pago
export const createSubscription = async (
  planId: string,
  userId: string,
  paymentMethodId: string
) => {
  const plan = Object.values(MERCADOPAGO_PLANS).find(p => p.id === planId);

  if (!plan) {
    throw new Error('Plano não encontrado');
  }

  const subscription = {
    plan_id: plan.mpPlanId,
    subscriber: {
      id: userId,
    },
    application_fee: 0,
    status: 'authorized',
    external_reference: `user_${userId}_plan_${planId}`,
    // Configurações específicas para assinaturas
    frequency: MERCADOPAGO_CONFIG.subscription.frequency,
    frequency_type: MERCADOPAGO_CONFIG.subscription.frequencyType,
    trial_period_days: MERCADOPAGO_CONFIG.subscription.trialPeriodDays,
    // URLs de retorno
    back_urls: {
      success: MERCADOPAGO_CONFIG.subscription.successUrl,
      failure: MERCADOPAGO_CONFIG.subscription.failureUrl,
      pending: MERCADOPAGO_CONFIG.subscription.pendingUrl,
    },
    // Webhook para notificações
    notification_url: MERCADOPAGO_CONFIG.subscription.webhookUrl,
  };

  return subscription;
};

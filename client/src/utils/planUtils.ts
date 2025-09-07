import { getApiUrl } from './api';

export interface PlanLimit {
  resource: string;
  current: number;
  max: number | null;
  canAdd: boolean;
  plan?: string;
}

export interface PlanLimitResult {
  canProceed: boolean;
  limit?: PlanLimit;
  error?: any;
}

/**
 * Verifica se o usuário pode adicionar mais recursos baseado no seu plano
 * @param resource - Tipo de recurso (students, workouts, etc.)
 * @returns Promise com resultado da verificação
 */
export const checkPlanLimit = async (
  resource: string
): Promise<PlanLimitResult> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return {
        canProceed: false,
        error: { message: 'Token não encontrado' },
      };
    }

    const response = await fetch(getApiUrl(`/plans/check-limit/${resource}`), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 403) {
      const errorData = await response.json();
      return {
        canProceed: false,
        error: errorData,
        limit: errorData.planLimits,
      };
    }

    if (!response.ok) {
      return {
        canProceed: false,
        error: { message: 'Erro ao verificar limite' },
      };
    }

    const data = await response.json();
    return {
      canProceed: data.success && data.canProceed,
      limit: data.limit,
    };
  } catch (err) {
    console.error('Erro ao verificar limite do plano:', err);
    return {
      canProceed: false,
      error: {
        message: err instanceof Error ? err.message : 'Erro desconhecido',
      },
    };
  }
};

/**
 * Verifica se o usuário pode adicionar mais alunos
 * @returns Promise com resultado da verificação
 */
export const checkStudentLimit = async (): Promise<PlanLimitResult> => {
  return checkPlanLimit('students');
};

/**
 * Verifica se o usuário pode criar mais treinos
 * @returns Promise com resultado da verificação
 */
export const checkWorkoutLimit = async (): Promise<PlanLimitResult> => {
  return checkPlanLimit('workouts');
};

/**
 * Formata mensagem de limite atingido
 * @param limit - Informações do limite
 * @returns Mensagem formatada
 */
export const formatLimitMessage = (limit: PlanLimit): string => {
  if (limit.max === null) {
    return 'Você tem acesso ilimitado a este recurso.';
  }

  if (limit.canAdd) {
    const remaining = limit.max - limit.current;
    return `Você pode adicionar mais ${remaining} ${
      limit.resource === 'students' ? 'alunos' : 'treinos'
    }.`;
  }

  return `Você atingiu o limite de ${limit.max} ${
    limit.resource === 'students' ? 'alunos' : 'treinos'
  } do seu plano ${limit.plan}.`;
};

/**
 * Obtém informações do plano atual do usuário
 * @returns Promise com dados do plano
 */
export const getCurrentPlan = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token não encontrado');
    }

    const response = await fetch(getApiUrl('/plans/user'), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar plano do usuário');
    }

    const data = await response.json();
    return data.success ? data.plan : null;
  } catch (err) {
    console.error('Erro ao buscar plano atual:', err);
    return null;
  }
};

/**
 * Obtém todos os planos disponíveis
 * @returns Promise com lista de planos
 */
export const getAllPlans = async () => {
  try {
    const response = await fetch(getApiUrl('/plans'), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar planos');
    }

    const data = await response.json();
    return data.success ? data.plans : [];
  } catch (err) {
    console.error('Erro ao buscar planos:', err);
    return [];
  }
};

/**
 * Faz upgrade do plano do usuário
 * @param planId - ID do novo plano
 * @param subscriptionId - ID da assinatura (opcional)
 * @returns Promise com resultado do upgrade
 */
export const upgradePlan = async (planId: string, subscriptionId?: string) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token não encontrado');
    }

    const response = await fetch(getApiUrl('/plans/upgrade'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        subscriptionId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao fazer upgrade do plano');
    }

    const data = await response.json();
    return data.success ? data.plan : null;
  } catch (err) {
    console.error('Erro ao fazer upgrade do plano:', err);
    throw err;
  }
};

/**
 * Cancela a assinatura do usuário
 * @returns Promise com resultado do cancelamento
 */
export const cancelSubscription = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token não encontrado');
    }

    const response = await fetch(getApiUrl('/plans/cancel'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao cancelar assinatura');
    }

    const data = await response.json();
    return data.success ? data.plan : null;
  } catch (err) {
    console.error('Erro ao cancelar assinatura:', err);
    throw err;
  }
};

/**
 * Verifica se o usuário tem um plano específico ou superior
 * @param currentPlanId - ID do plano atual
 * @param requiredPlanId - ID do plano mínimo necessário
 * @returns true se o usuário tem o plano necessário
 */
export const hasRequiredPlan = (
  currentPlanId: string,
  requiredPlanId: string
): boolean => {
  const planHierarchy = { free: 1, basic: 2, premium: 3 };
  const currentLevel =
    planHierarchy[currentPlanId as keyof typeof planHierarchy] || 0;
  const requiredLevel =
    planHierarchy[requiredPlanId as keyof typeof planHierarchy] || 0;

  return currentLevel >= requiredLevel;
};

/**
 * Obtém o nome do plano baseado no ID
 * @param planId - ID do plano
 * @returns Nome do plano
 */
export const getPlanName = (planId: string): string => {
  const planNames = {
    free: 'Gratuito',
    basic: 'Básico',
    premium: 'Premium',
  };

  return planNames[planId as keyof typeof planNames] || 'Desconhecido';
};

/**
 * Obtém a cor do plano baseado no ID
 * @param planId - ID do plano
 * @returns Cor hexadecimal
 */
export const getPlanColor = (planId: string): string => {
  const planColors = {
    free: '#64748b',
    basic: '#3b82f6',
    premium: '#f59e0b',
  };

  return planColors[planId as keyof typeof planColors] || '#64748b';
};

/**
 * Obtém o ícone do plano baseado no ID
 * @param planId - ID do plano
 * @returns Nome do ícone
 */
export const getPlanIcon = (planId: string): string => {
  const planIcons = {
    free: 'Lock',
    basic: 'Zap',
    premium: 'Crown',
  };

  return planIcons[planId as keyof typeof planIcons] || 'Lock';
};

/**
 * Formata o preço do plano
 * @param price - Preço do plano
 * @returns Preço formatado em reais
 */
export const formatPlanPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
};

/**
 * Verifica se o plano é gratuito
 * @param planId - ID do plano
 * @returns true se o plano é gratuito
 */
export const isFreePlan = (planId: string): boolean => {
  return planId === 'free';
};

/**
 * Verifica se o plano é premium
 * @param planId - ID do plano
 * @returns true se o plano é premium
 */
export const isPremiumPlan = (planId: string): boolean => {
  return planId === 'premium';
};

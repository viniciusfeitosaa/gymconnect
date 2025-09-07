import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl } from '../utils/api';

interface Plan {
  id: string;
  name: string;
  price: number;
  maxStudents: number | null;
  features: string[];
  isActive: boolean;
  expiresAt?: string;
  planStatus?: string;
  subscriptionId?: string;
}

interface PlanContextType {
  currentPlan: Plan | null;
  setCurrentPlan: (plan: Plan | null) => void;
  upgradePlan: (planId: string, subscriptionId?: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  checkPlanLimit: (
    resource: string
  ) => Promise<{ canProceed: boolean; limit?: any; error?: any }>;
  isLoading: boolean;
  error: string | null;
  refreshPlan: () => Promise<void>;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};

interface PlanProviderProps {
  children: React.ReactNode;
}

export const PlanProvider: React.FC<PlanProviderProps> = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar plano atual do usuário
  const fetchUserPlan = async () => {
    try {
      setIsLoading(true);
      setError(null);

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
        if (response.status === 401) {
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        throw new Error('Erro ao buscar plano do usuário');
      }

      const data = await response.json();

      if (data.success && data.plan) {
        setCurrentPlan(data.plan);
        // Salvar no localStorage para cache
        localStorage.setItem('currentPlan', JSON.stringify(data.plan));
      } else {
        throw new Error('Plano não encontrado');
      }
    } catch (err) {
      console.error('Erro ao buscar plano do usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');

      // Fallback para plano gratuito
      const fallbackPlan: Plan = {
        id: 'free',
        name: 'Gratuito',
        price: 0,
        maxStudents: 1,
        features: ['1 aluno', 'Treinos ilimitados', 'Acesso básico'],
        isActive: true,
        planStatus: 'active',
      };
      setCurrentPlan(fallbackPlan);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar plano atual ao inicializar (apenas se houver token)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserPlan();
    }
  }, []);

  // Função para atualizar plano
  const upgradePlan = async (planId: string, subscriptionId?: string) => {
    try {
      setIsLoading(true);
      setError(null);

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

      if (data.success && data.plan) {
        setCurrentPlan(data.plan);
        localStorage.setItem('currentPlan', JSON.stringify(data.plan));
        console.log(`Plano ${data.plan.name} ativado com sucesso!`);
      } else {
        throw new Error('Erro ao processar upgrade');
      }
    } catch (err) {
      console.error('Erro ao fazer upgrade do plano:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para cancelar assinatura
  const cancelSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);

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

      if (data.success && data.plan) {
        setCurrentPlan(data.plan);
        localStorage.setItem('currentPlan', JSON.stringify(data.plan));
        console.log('Assinatura cancelada com sucesso!');
      } else {
        throw new Error('Erro ao processar cancelamento');
      }
    } catch (err) {
      console.error('Erro ao cancelar assinatura:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para verificar limites do plano
  const checkPlanLimit = async (resource: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { canProceed: false, error: 'Token não encontrado' };
      }

      const response = await fetch(
        getApiUrl(`/plans/check-limit/${resource}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 403) {
        const errorData = await response.json();
        return {
          canProceed: false,
          error: errorData,
          limit: errorData.planLimits,
        };
      }

      if (!response.ok) {
        return { canProceed: false, error: 'Erro ao verificar limite' };
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
        error: err instanceof Error ? err.message : 'Erro desconhecido',
      };
    }
  };

  // Função para atualizar plano
  const refreshPlan = async () => {
    await fetchUserPlan();
  };

  const value: PlanContextType = {
    currentPlan,
    setCurrentPlan,
    upgradePlan,
    cancelSubscription,
    checkPlanLimit,
    isLoading,
    error,
    refreshPlan,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};

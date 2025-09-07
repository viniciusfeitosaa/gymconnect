import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MERCADOPAGO_CONFIG,
  MERCADOPAGO_PLANS,
  createSubscription as createSubscriptionData,
} from '../config/mercadopago';

interface MercadoPagoContextType {
  isLoading: boolean;
  error: string | null;
  createSubscription: (
    planId: string,
    paymentMethodId: string
  ) => Promise<{ subscriptionId: any; status: any }>;
  openCustomerPortal: () => Promise<void>;
}

const MercadoPagoContext = createContext<MercadoPagoContextType | undefined>(
  undefined
);

export const useMercadoPago = () => {
  const context = useContext(MercadoPagoContext);
  if (context === undefined) {
    throw new Error('useMercadoPago must be used within a MercadoPagoProvider');
  }
  return context;
};

interface MercadoPagoProviderProps {
  children: React.ReactNode;
}

export const MercadoPagoProvider: React.FC<MercadoPagoProviderProps> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar SDK do Mercado Pago
  useEffect(() => {
    // Para assinaturas, não precisamos carregar o SDK do frontend
    // O processamento será feito no backend
    console.log('MercadoPago Context inicializado para assinaturas');
  }, []);

  const createSubscription = async (
    planId: string,
    paymentMethodId: string
  ): Promise<{ subscriptionId: any; status: any }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular criação de assinatura (em produção, isso seria feito no backend)
      console.log('Criando assinatura:', { planId, paymentMethodId });

      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular resposta de sucesso
      const mockResponse = {
        subscriptionId: `sub_${Date.now()}`,
        status: 'authorized',
      };

      console.log('Assinatura criada com sucesso:', mockResponse);
      return mockResponse;
    } catch (err) {
      console.error('Erro ao criar assinatura:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    try {
      // Simular abertura do portal do cliente
      console.log('Abrindo portal do cliente...');

      // Em produção, isso redirecionaria para o portal do Mercado Pago
      alert(
        'Portal do cliente será implementado quando o backend estiver configurado'
      );
    } catch (err) {
      console.error('Erro ao abrir portal do cliente:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    }
  };

  const value: MercadoPagoContextType = {
    isLoading,
    error,
    createSubscription,
    openCustomerPortal,
  };

  return (
    <MercadoPagoContext.Provider value={value}>
      {children}
    </MercadoPagoContext.Provider>
  );
};

// Declaração global removida - não precisamos mais do SDK do frontend

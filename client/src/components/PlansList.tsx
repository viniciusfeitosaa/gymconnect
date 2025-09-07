import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Star,
  Users,
  CreditCard,
  ArrowLeft,
  Crown,
  Zap,
} from 'lucide-react';
import './PlansList.css';
import PaymentModal from './PaymentModal';
import SubscriptionCheckout from './SubscriptionCheckout';
import { usePlan } from '../contexts/PlanContext';
import { useMercadoPago } from '../contexts/MercadoPagoContext';
import { MERCADOPAGO_PLANS } from '../config/mercadopago';
import { getAllPlans } from '../utils/planUtils';

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  maxStudents: number | null; // null = ilimitado
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary' | 'outline';
}

interface ApiPlan {
  id: string;
  name: string;
  price: number;
  max_students: number | null;
  features: string[] | string;
}

const PlansList: React.FC = () => {
  const { currentPlan, upgradePlan, isLoading } = usePlan();
  const { createSubscription } = useMercadoPago();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSubscriptionCheckout, setShowSubscriptionCheckout] =
    useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Carregar planos da API
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoadingPlans(true);
        const apiPlans = await getAllPlans();

        // Transformar planos da API para o formato do componente
        const transformedPlans: Plan[] = apiPlans.map((plan: ApiPlan) => ({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          description: getPlanDescription(plan.id),
          maxStudents: plan.max_students,
          features: Array.isArray(plan.features) ? plan.features : [],
          isPopular: plan.id === 'basic',
          buttonText:
            currentPlan?.id === plan.id
              ? 'Plano Atual'
              : getButtonText(plan.id),
          buttonVariant:
            currentPlan?.id === plan.id ? 'outline' : getButtonVariant(plan.id),
          isCurrent: currentPlan?.id === plan.id,
        }));

        setAvailablePlans(transformedPlans);
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
        // Fallback para planos padrão
        setAvailablePlans(getDefaultPlans());
      } finally {
        setLoadingPlans(false);
      }
    };

    loadPlans();
  }, [currentPlan]);

  const getPlanDescription = (planId: string): string => {
    switch (planId) {
      case 'free':
        return 'Perfeito para começar';
      case 'basic':
        return 'Ideal para personal trainers';
      case 'premium':
        return 'Para academias e grandes personal trainers';
      default:
        return 'Plano personalizado';
    }
  };

  const getButtonText = (planId: string): string => {
    if (currentPlan?.id === planId) return 'Plano Atual';
    if (planId === 'free') return 'Ativar Gratuitamente';
    return 'Escolher Plano';
  };

  const getButtonVariant = (
    planId: string
  ): 'primary' | 'secondary' | 'outline' => {
    if (currentPlan?.id === planId) return 'outline';
    if (planId === 'basic') return 'primary';
    if (planId === 'premium') return 'secondary';
    return 'primary';
  };

  const getDefaultPlans = (): Plan[] => [
    {
      id: 'free',
      name: 'Gratuito',
      price: 0,
      description: 'Perfeito para começar',
      maxStudents: 1,
      features: [
        '1 aluno',
        'Treinos ilimitados',
        'Acesso básico ao dashboard',
        'Suporte por email',
      ],
      buttonText: 'Plano Atual',
      buttonVariant: 'outline',
      isCurrent: currentPlan?.id === 'free',
    },
    {
      id: 'basic',
      name: 'Básico',
      price: 15,
      originalPrice: 25,
      description: 'Ideal para personal trainers',
      maxStudents: 4,
      features: [
        'Até 4 alunos',
        'Treinos ilimitados',
        'Dashboard completo',
        'Relatórios de progresso',
        'Suporte prioritário',
        'Backup automático',
      ],
      isPopular: true,
      buttonText:
        currentPlan?.id === 'basic' ? 'Plano Atual' : 'Escolher Plano',
      buttonVariant: currentPlan?.id === 'basic' ? 'outline' : 'primary',
      isCurrent: currentPlan?.id === 'basic',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 29.9,
      originalPrice: 49.9,
      description: 'Para academias e grandes personal trainers',
      maxStudents: null,
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
      buttonText:
        currentPlan?.id === 'premium' ? 'Plano Atual' : 'Escolher Plano',
      buttonVariant: currentPlan?.id === 'premium' ? 'outline' : 'secondary',
      isCurrent: currentPlan?.id === 'premium',
    },
  ];

  const handlePlanSelection = async (planId: string) => {
    if (planId === currentPlan?.id) return;

    const plan = availablePlans.find(p => p.id === planId);
    if (!plan) return;

    // Se for o plano gratuito, ativar diretamente
    if (planId === 'free') {
      await upgradePlan(planId);
      return;
    }

    // Para planos pagos, usar Assinatura
    setSelectedPlan(plan);
    setShowSubscriptionCheckout(true);
  };

  const handlePaymentSuccess = async (planId: string) => {
    try {
      await upgradePlan(planId);
      setShowPaymentModal(false);
      setShowSubscriptionCheckout(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Erro ao ativar plano:', error);
    }
  };

  const getMercadoPagoPlanData = (planId: string) => {
    const mpProduct = Object.values(MERCADOPAGO_PLANS).find(
      p => p.id === planId.toLowerCase()
    );

    return {
      id: planId,
      name: mpProduct?.name || 'Plano',
      price: mpProduct?.price || 0,
      maxStudents: mpProduct?.maxStudents || null,
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Users size={24} />;
      case 'basic':
        return <Zap size={24} />;
      case 'premium':
        return <Crown size={24} />;
      default:
        return <CreditCard size={24} />;
    }
  };

  const getPlanGradient = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'linear-gradient(135deg, #6b7280, #4b5563)';
      case 'basic':
        return 'linear-gradient(135deg, #3b82f6, #1e40af)';
      case 'premium':
        return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
      default:
        return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: 'clamp(1rem, 4vw, 2rem)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 'clamp(2rem, 5vw, 3rem)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <Link
              to="/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#94a3b8',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              <ArrowLeft size={20} />
              Voltar ao Dashboard
            </Link>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Escolha seu Plano
          </h1>

          <p
            style={{
              fontSize: '1.125rem',
              color: '#94a3b8',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6',
            }}
          >
            Gerencie seus alunos e treinos com eficiência. Escolha o plano que
            melhor se adapta ao seu negócio.
          </p>
        </div>

        {/* Plans Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
            gap: 'clamp(1rem, 3vw, 2rem)',
            marginBottom: 'clamp(2rem, 5vw, 3rem)',
          }}
        >
          {loadingPlans ? (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '2rem',
                color: '#94a3b8',
              }}
            >
              Carregando planos...
            </div>
          ) : (
            availablePlans.map(plan => (
              <div
                key={plan.id}
                className={`plan-card ${plan.isPopular ? 'popular' : ''} ${
                  plan.isCurrent ? 'current' : ''
                }`}
                style={{
                  position: 'relative',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: plan.isPopular
                    ? '2px solid #3b82f6'
                    : plan.isCurrent
                    ? '2px solid #10b981'
                    : '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '1.5rem',
                  padding: 'clamp(1rem, 3vw, 2rem)',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  width: '100%',
                  minHeight: 'fit-content',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow =
                    '0 20px 40px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-1px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                      color: 'white',
                      padding:
                        'clamp(0.25rem, 1vw, 0.5rem) clamp(1rem, 4vw, 2rem)',
                      borderRadius: '0 0 1rem 1rem',
                      fontSize: 'clamp(0.7rem, 2vw, 0.875rem)',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Star size={16} fill="currentColor" />
                    Mais Popular
                  </div>
                )}

                {/* Current Plan Badge */}
                {plan.isCurrent && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-1px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      padding:
                        'clamp(0.25rem, 1vw, 0.5rem) clamp(1rem, 4vw, 2rem)',
                      borderRadius: '0 0 1rem 1rem',
                      fontSize: 'clamp(0.7rem, 2vw, 0.875rem)',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Check size={16} fill="currentColor" />
                    Plano Atual
                  </div>
                )}

                {/* Plan Header */}
                <div
                  style={{
                    textAlign: 'center',
                    marginBottom: '2rem',
                    paddingTop: plan.isPopular || plan.isCurrent ? '2rem' : '0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        padding: '1rem',
                        borderRadius: '1rem',
                        background: getPlanGradient(plan.id),
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {getPlanIcon(plan.id)}
                    </div>
                  </div>

                  <h3
                    style={{
                      fontSize: 'clamp(1rem, 3vw, 1.5rem)',
                      fontWeight: 'bold',
                      color: 'white',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {plan.name}
                  </h3>

                  <p
                    style={{
                      color: '#94a3b8',
                      fontSize: 'clamp(0.7rem, 2vw, 0.875rem)',
                      marginBottom: '1.5rem',
                      lineHeight: '1.4',
                    }}
                  >
                    {plan.description}
                  </p>

                  <div
                    style={{
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 'clamp(2rem, 5vw, 3rem)',
                          fontWeight: 'bold',
                          color: 'white',
                        }}
                      >
                        {plan.price === 0
                          ? 'Grátis'
                          : formatCurrency(plan.price)}
                      </span>
                      {plan.price > 0 && (
                        <span
                          style={{
                            fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                            color: '#94a3b8',
                          }}
                        >
                          /mês
                        </span>
                      )}
                    </div>

                    {plan.originalPrice && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          marginTop: '0.5rem',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '1rem',
                            color: '#94a3b8',
                            textDecoration: 'line-through',
                          }}
                        >
                          {formatCurrency(plan.originalPrice)}
                        </span>
                        <span
                          style={{
                            fontSize: '0.875rem',
                            color: '#10b981',
                            fontWeight: '600',
                            background: 'rgba(16, 185, 129, 0.1)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.375rem',
                          }}
                        >
                          Economize{' '}
                          {formatCurrency(plan.originalPrice - plan.price)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: '#94a3b8',
                      marginBottom: '2rem',
                    }}
                  >
                    {plan.maxStudents === null
                      ? 'Alunos ilimitados'
                      : `Até ${plan.maxStudents} aluno${
                          plan.maxStudents > 1 ? 's' : ''
                        }`}
                  </div>
                </div>

                {/* Features */}
                <div
                  style={{
                    marginBottom: '2rem',
                  }}
                >
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.5rem 0',
                          color: '#e2e8f0',
                          fontSize: '0.875rem',
                        }}
                      >
                        <Check
                          size={16}
                          style={{
                            color: '#10b981',
                            flexShrink: 0,
                          }}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handlePlanSelection(plan.id)}
                  disabled={plan.isCurrent || isLoading}
                  style={{
                    width: '100%',
                    padding:
                      'clamp(0.75rem, 2vw, 0.875rem) clamp(1rem, 3vw, 1.5rem)',
                    borderRadius: '0.75rem',
                    border: 'none',
                    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                    fontWeight: '600',
                    cursor: plan.isCurrent ? 'default' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: plan.isCurrent || isLoading ? 0.6 : 1,
                    ...(plan.buttonVariant === 'primary'
                      ? {
                          background:
                            'linear-gradient(135deg, #3b82f6, #1e40af)',
                          color: 'white',
                          boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.25)',
                        }
                      : plan.buttonVariant === 'secondary'
                      ? {
                          background:
                            'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                          color: 'white',
                          boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.25)',
                        }
                      : {
                          background: 'transparent',
                          color: '#10b981',
                          border: '2px solid #10b981',
                        }),
                  }}
                  onMouseEnter={e => {
                    if (!plan.isCurrent && !isLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      if (plan.buttonVariant === 'primary') {
                        e.currentTarget.style.boxShadow =
                          '0 6px 20px 0 rgba(59, 130, 246, 0.35)';
                      } else if (plan.buttonVariant === 'secondary') {
                        e.currentTarget.style.boxShadow =
                          '0 6px 20px 0 rgba(139, 92, 246, 0.35)';
                      }
                    }
                  }}
                  onMouseLeave={e => {
                    if (!plan.isCurrent && !isLoading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      if (plan.buttonVariant === 'primary') {
                        e.currentTarget.style.boxShadow =
                          '0 4px 14px 0 rgba(59, 130, 246, 0.25)';
                      } else if (plan.buttonVariant === 'secondary') {
                        e.currentTarget.style.boxShadow =
                          '0 4px 14px 0 rgba(139, 92, 246, 0.25)';
                      }
                    }
                  }}
                >
                  {isLoading ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <div className="loading-spinner" />
                      Processando...
                    </div>
                  ) : (
                    plan.buttonText
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Additional Info */}
        <div
          style={{
            textAlign: 'center',
            padding: 'clamp(1rem, 3vw, 2rem)',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            borderRadius: '1rem',
            border: '1px solid rgba(59, 130, 246, 0.3)',
          }}
        >
          <h3
            style={{
              fontSize: 'clamp(1rem, 3vw, 1.25rem)',
              fontWeight: '600',
              color: 'white',
              marginBottom: '1rem',
            }}
          >
            💳 Pagamento Seguro
          </h3>
          <p
            style={{
              color: '#94a3b8',
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
              lineHeight: '1.6',
              marginBottom: '1rem',
            }}
          >
            Aceitamos cartões de crédito, débito e PIX. Todos os pagamentos são
            processados de forma segura.
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'clamp(1rem, 3vw, 2rem)',
              flexWrap: 'wrap',
              fontSize: 'clamp(0.65rem, 2vw, 0.75rem)',
              color: '#6b7280',
            }}
          >
            <span>🔒 SSL Seguro</span>
            <span>💳 Cartões Aceitos</span>
            <span>🔄 Cancelamento Fácil</span>
            <span>📞 Suporte 24/7</span>
          </div>
        </div>
      </div>

      {/* Payment Modals */}
      {selectedPlan && (
        <>
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedPlan(null);
            }}
            plan={selectedPlan}
            onPaymentSuccess={handlePaymentSuccess}
          />

          <SubscriptionCheckout
            isOpen={showSubscriptionCheckout}
            onClose={() => {
              setShowSubscriptionCheckout(false);
              setSelectedPlan(null);
            }}
            plan={getMercadoPagoPlanData(selectedPlan.id)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </>
      )}
    </div>
  );
};

export default PlansList;

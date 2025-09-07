import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckCircle,
  ArrowRight,
  CreditCard,
  Calendar,
  Users,
} from 'lucide-react';
import './PaymentSuccess.css';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = searchParams.get('session_id');
    if (session) {
      setSessionId(session);
      fetchSubscriptionDetails(session);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchSubscriptionDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/checkout-session/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionDetails(data);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da assinatura:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="payment-success-container">
        <div className="loading-state">
          <div className="loading-spinner" />
          <h2>Carregando detalhes da assinatura...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-container">
      <div className="success-content">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">
            <CheckCircle size={80} />
          </div>
          <h1>Pagamento Realizado com Sucesso!</h1>
          <p>
            Sua assinatura foi ativada e você já pode começar a usar todas as
            funcionalidades do GymConnect.
          </p>
        </div>

        {/* Subscription Details */}
        {subscriptionDetails && (
          <div className="subscription-details">
            <h2>Detalhes da Assinatura</h2>
            <div className="details-grid">
              <div className="detail-card">
                <div className="detail-icon">
                  <CreditCard size={24} />
                </div>
                <div className="detail-content">
                  <h3>Plano</h3>
                  <p>{subscriptionDetails.planName || 'Plano Ativo'}</p>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon">
                  <Calendar size={24} />
                </div>
                <div className="detail-content">
                  <h3>Próxima Cobrança</h3>
                  <p>
                    {subscriptionDetails.nextBillingDate
                      ? formatDate(subscriptionDetails.nextBillingDate)
                      : 'Em 30 dias'}
                  </p>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon">
                  <Users size={24} />
                </div>
                <div className="detail-content">
                  <h3>Valor</h3>
                  <p>
                    {subscriptionDetails.amount
                      ? formatCurrency(subscriptionDetails.amount)
                      : 'R$ 0,00'}{' '}
                    /mês
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="next-steps">
          <h2>Próximos Passos</h2>
          <div className="steps-list">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Adicione seus Alunos</h3>
                <p>
                  Comece adicionando seus primeiros alunos ao sistema para
                  gerenciar seus treinos.
                </p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Crie Treinos Personalizados</h3>
                <p>
                  Desenvolva treinos específicos para cada aluno com exercícios
                  detalhados.
                </p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Acompanhe o Progresso</h3>
                <p>
                  Monitore a evolução dos seus alunos através de relatórios
                  detalhados.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Link to="/dashboard" className="primary-button">
            <Users size={20} />
            Ir para o Dashboard
            <ArrowRight size={20} />
          </Link>

          <Link to="/dashboard/students/new" className="secondary-button">
            Adicionar Primeiro Aluno
          </Link>
        </div>

        {/* Support Info */}
        <div className="support-info">
          <h3>Precisa de Ajuda?</h3>
          <p>
            Nossa equipe de suporte está pronta para ajudar você a aproveitar ao
            máximo o GymConnect.
          </p>
          <div className="support-contacts">
            <a href="mailto:suporte@gymconnect.com" className="support-link">
              📧 suporte@gymconnect.com
            </a>
            <a href="tel:+5511999999999" className="support-link">
              📞 (11) 99999-9999
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

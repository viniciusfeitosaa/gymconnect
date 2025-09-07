import React, { useState } from 'react';
import {
  X,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader,
  Calendar,
  Users,
  Crown,
} from 'lucide-react';
import { useMercadoPago } from '../contexts/MercadoPagoContext';
import './SubscriptionCheckout.css';

interface SubscriptionCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name: string;
    price: number;
    maxStudents: number | null;
  };
  onPaymentSuccess: (planId: string) => void;
}

const SubscriptionCheckout: React.FC<SubscriptionCheckoutProps> = ({
  isOpen,
  onClose,
  plan,
  onPaymentSuccess,
}) => {
  const { createSubscription, isLoading, error } = useMercadoPago();
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  // Estados para formulário de cartão
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    email: '',
    phone: '',
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{4})(?=\d)/g, '$1 ')
      .slice(0, 19);
  };

  const formatExpiry = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(?=\d)/g, '$1/')
      .slice(0, 5);
  };

  const formatCVV = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');

    try {
      // Integrar com a API do Mercado Pago
      const result = await createSubscription(
        plan.id,
        'card_payment_method_id'
      );

      console.log('Assinatura criada:', result);

      setStep('success');
      setTimeout(() => {
        onPaymentSuccess(plan.id);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Erro na assinatura:', error);
      setStep('form');
    }
  };

  const resetModal = () => {
    setStep('form');
    setCardData({
      number: '',
      expiry: '',
      cvv: '',
      name: '',
      email: '',
      phone: '',
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="subscription-checkout-overlay">
      <div className="subscription-checkout-modal">
        {/* Header */}
        <div className="subscription-checkout-header">
          <div className="header-content">
            <Crown size={24} className="header-icon" />
            <h2>Assinar Plano</h2>
          </div>
          <button onClick={handleClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        {/* Plan Summary */}
        <div className="plan-summary">
          <div className="plan-info">
            <h3>{plan.name}</h3>
            <div className="plan-features">
              <div className="feature">
                <Users size={16} />
                <span>
                  {plan.maxStudents === null
                    ? 'Alunos ilimitados'
                    : `Até ${plan.maxStudents} aluno${
                        plan.maxStudents > 1 ? 's' : ''
                      }`}
                </span>
              </div>
              <div className="feature">
                <Calendar size={16} />
                <span>Cobrança mensal automática</span>
              </div>
            </div>
          </div>
          <div className="plan-price">
            <span className="price">{formatCurrency(plan.price)}</span>
            <span className="period">/mês</span>
          </div>
        </div>

        {/* Subscription Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="subscription-form">
            <div className="form-header">
              <CreditCard size={24} />
              <h4>Dados do Cartão</h4>
              <p>Preencha os dados para ativar sua assinatura</p>
            </div>

            <div className="form-group">
              <label>Número do Cartão</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardData.number}
                onChange={e =>
                  setCardData({
                    ...cardData,
                    number: formatCardNumber(e.target.value),
                  })
                }
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Validade</label>
                <input
                  type="text"
                  placeholder="MM/AA"
                  value={cardData.expiry}
                  onChange={e =>
                    setCardData({
                      ...cardData,
                      expiry: formatExpiry(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={e =>
                    setCardData({
                      ...cardData,
                      cvv: formatCVV(e.target.value),
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Nome no Cartão</label>
              <input
                type="text"
                placeholder="João Silva"
                value={cardData.name}
                onChange={e =>
                  setCardData({ ...cardData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={cardData.email}
                onChange={e =>
                  setCardData({ ...cardData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Telefone (opcional)</label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={cardData.phone}
                onChange={e =>
                  setCardData({ ...cardData, phone: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              className="subscribe-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="spinner" />
                  Processando...
                </>
              ) : (
                <>
                  <Crown size={20} />
                  Assinar por {formatCurrency(plan.price)}/mês
                </>
              )}
            </button>

            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </form>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="processing-step">
            <Loader size={48} className="spinner large" />
            <h3>Ativando sua assinatura...</h3>
            <p>Aguarde enquanto processamos sua solicitação</p>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="success-step">
            <CheckCircle size={64} className="success-icon" />
            <h3>Assinatura ativada com sucesso!</h3>
            <p>
              Seu plano foi ativado e você já pode começar a usar todas as
              funcionalidades.
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="subscription-footer">
          <div className="trial-info">
            <h4>🎉 7 dias grátis</h4>
            <p>Cancele a qualquer momento, sem taxas</p>
          </div>
          <div className="security-info">
            <div className="security-badges">
              <span className="security-badge">
                <CheckCircle size={16} />
                SSL 256-bit
              </span>
              <span className="security-badge">
                <CheckCircle size={16} />
                Mercado Pago
              </span>
            </div>
            <p>Seus dados estão protegidos com a máxima segurança</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCheckout;

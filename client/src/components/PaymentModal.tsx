import React, { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import './PaymentModal.css';

interface PaymentModalProps {
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

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  onPaymentSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });
  const [pixData, setPixData] = useState({
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

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

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular sucesso/erro baseado em dados do cartão
      if (cardData.number.length < 16) {
        throw new Error('Número do cartão inválido');
      }

      setStep('success');
      setTimeout(() => {
        onPaymentSuccess(plan.id);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no processamento');
    } finally {
      setLoading(false);
    }
  };

  const handlePixSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simular geração de PIX
      await new Promise(resolve => setTimeout(resolve, 1500));

      setStep('success');
      setTimeout(() => {
        onPaymentSuccess(plan.id);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar PIX');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('form');
    setError('');
    setCardData({ number: '', expiry: '', cvv: '', name: '' });
    setPixData({ email: '', phone: '' });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        {/* Header */}
        <div className="payment-modal-header">
          <h2>Finalizar Pagamento</h2>
          <button onClick={handleClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        {/* Plan Summary */}
        <div className="plan-summary">
          <div className="plan-info">
            <h3>{plan.name}</h3>
            <p>
              {plan.maxStudents === null
                ? 'Alunos ilimitados'
                : `Até ${plan.maxStudents} aluno${
                    plan.maxStudents > 1 ? 's' : ''
                  }`}
            </p>
          </div>
          <div className="plan-price">
            <span className="price">
              {plan.price === 0 ? 'Grátis' : formatCurrency(plan.price)}
            </span>
            {plan.price > 0 && <span className="period">/mês</span>}
          </div>
        </div>

        {/* Payment Steps */}
        {step === 'form' && (
          <div className="payment-form">
            {/* Payment Method Selection */}
            <div className="payment-methods">
              <h4>Escolha a forma de pagamento</h4>
              <div className="method-options">
                <button
                  className={`method-option ${
                    paymentMethod === 'card' ? 'active' : ''
                  }`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={20} />
                  Cartão de Crédito
                </button>
                <button
                  className={`method-option ${
                    paymentMethod === 'pix' ? 'active' : ''
                  }`}
                  onClick={() => setPaymentMethod('pix')}
                >
                  <Lock size={20} />
                  PIX
                </button>
              </div>
            </div>

            {/* Card Payment Form */}
            {paymentMethod === 'card' && (
              <form onSubmit={handleCardSubmit} className="card-form">
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

                {error && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button type="submit" className="pay-button" disabled={loading}>
                  {loading
                    ? 'Processando...'
                    : `Pagar ${formatCurrency(plan.price)}`}
                </button>
              </form>
            )}

            {/* PIX Payment Form */}
            {paymentMethod === 'pix' && (
              <form onSubmit={handlePixSubmit} className="pix-form">
                <div className="pix-info">
                  <div className="pix-icon">
                    <Lock size={32} />
                  </div>
                  <h4>Pagamento via PIX</h4>
                  <p>
                    Pague instantaneamente com PIX e tenha acesso imediato ao
                    seu plano.
                  </p>
                </div>

                <div className="form-group">
                  <label>E-mail</label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={pixData.email}
                    onChange={e =>
                      setPixData({ ...pixData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Telefone (opcional)</label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={pixData.phone}
                    onChange={e =>
                      setPixData({ ...pixData, phone: e.target.value })
                    }
                  />
                </div>

                {error && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="pay-button pix-button"
                  disabled={loading}
                >
                  {loading
                    ? 'Gerando PIX...'
                    : `Gerar PIX - ${formatCurrency(plan.price)}`}
                </button>
              </form>
            )}

            {/* Security Info */}
            <div className="security-info">
              <Lock size={16} />
              <span>Seus dados estão protegidos com criptografia SSL</span>
            </div>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="processing-step">
            <div className="loading-spinner large" />
            <h3>Processando pagamento...</h3>
            <p>Aguarde enquanto processamos sua solicitação</p>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="success-step">
            <CheckCircle size={64} className="success-icon" />
            <h3>Pagamento realizado com sucesso!</h3>
            <p>
              Seu plano foi ativado e você já pode começar a usar todas as
              funcionalidades.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;

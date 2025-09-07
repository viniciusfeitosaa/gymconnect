import React from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  AlertTriangle,
  Users,
  Dumbbell,
  Crown,
  Zap,
  Lock,
} from 'lucide-react';
import { PlanLimit } from '../utils/planUtils';
import './PlanLimitModal.css';

interface PlanLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: string;
  limit: PlanLimit;
  currentPlan: string;
}

const PlanLimitModal: React.FC<PlanLimitModalProps> = ({
  isOpen,
  onClose,
  resource,
  limit,
  currentPlan,
}) => {
  if (!isOpen) return null;

  const getResourceIcon = () => {
    switch (resource) {
      case 'students':
        return <Users size={24} />;
      case 'workouts':
        return <Dumbbell size={24} />;
      default:
        return <AlertTriangle size={24} />;
    }
  };

  const getResourceName = () => {
    switch (resource) {
      case 'students':
        return 'alunos';
      case 'workouts':
        return 'treinos';
      default:
        return 'recursos';
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Lock size={20} />;
      case 'basic':
        return <Zap size={20} />;
      case 'premium':
        return <Crown size={20} />;
      default:
        return <Lock size={20} />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free':
        return '#64748b';
      case 'basic':
        return '#3b82f6';
      case 'premium':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  const getPlanName = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'Gratuito';
      case 'basic':
        return 'Básico';
      case 'premium':
        return 'Premium';
      default:
        return 'Desconhecido';
    }
  };

  const getUpgradeMessage = () => {
    if (currentPlan === 'free') {
      return 'Upgrade para o Plano Básico e tenha acesso a até 4 alunos!';
    } else if (currentPlan === 'basic') {
      return 'Upgrade para o Plano Premium e tenha alunos ilimitados!';
    }
    return 'Considere fazer upgrade para um plano superior.';
  };

  const getRecommendedPlan = () => {
    if (currentPlan === 'free') {
      return 'basic';
    } else if (currentPlan === 'basic') {
      return 'premium';
    }
    return 'premium';
  };

  const recommendedPlan = getRecommendedPlan();

  return (
    <div className="plan-limit-modal-overlay">
      <div className="plan-limit-modal">
        <div className="plan-limit-modal-header">
          <div className="plan-limit-modal-icon">{getResourceIcon()}</div>
          <h2>Limite Atingido</h2>
          <button
            className="plan-limit-modal-close"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="plan-limit-modal-content">
          <div className="plan-limit-info">
            <p className="plan-limit-message">
              Você atingiu o limite de <strong>{limit.max}</strong>{' '}
              {getResourceName()} do seu plano atual.
            </p>

            <div className="current-plan-info">
              <div
                className="current-plan-badge"
                style={{
                  borderColor: getPlanColor(currentPlan),
                  backgroundColor: `${getPlanColor(currentPlan)}20`,
                }}
              >
                <div
                  className="current-plan-icon"
                  style={{ color: getPlanColor(currentPlan) }}
                >
                  {getPlanIcon(currentPlan)}
                </div>
                <span
                  className="current-plan-name"
                  style={{ color: getPlanColor(currentPlan) }}
                >
                  Plano {getPlanName(currentPlan)}
                </span>
              </div>
            </div>

            <div className="limit-stats">
              <div className="limit-stat">
                <span className="limit-stat-label">Usado:</span>
                <span className="limit-stat-value">{limit.current}</span>
              </div>
              <div className="limit-stat">
                <span className="limit-stat-label">Limite:</span>
                <span className="limit-stat-value">{limit.max}</span>
              </div>
            </div>
          </div>

          <div className="upgrade-section">
            <h3>Fazer Upgrade</h3>
            <p className="upgrade-message">{getUpgradeMessage()}</p>

            <div className="recommended-plan">
              <div
                className="recommended-plan-badge"
                style={{
                  borderColor: getPlanColor(recommendedPlan),
                  backgroundColor: `${getPlanColor(recommendedPlan)}20`,
                }}
              >
                <div
                  className="recommended-plan-icon"
                  style={{ color: getPlanColor(recommendedPlan) }}
                >
                  {getPlanIcon(recommendedPlan)}
                </div>
                <div className="recommended-plan-info">
                  <span
                    className="recommended-plan-name"
                    style={{ color: getPlanColor(recommendedPlan) }}
                  >
                    Plano {getPlanName(recommendedPlan)}
                  </span>
                  <span className="recommended-plan-benefit">
                    {recommendedPlan === 'basic'
                      ? 'Até 4 alunos'
                      : 'Alunos ilimitados'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="plan-limit-modal-actions">
          <button className="plan-limit-modal-cancel" onClick={onClose}>
            Fechar
          </button>

          <Link
            to="/dashboard/plans"
            className="plan-limit-modal-upgrade"
            onClick={onClose}
          >
            Ver Planos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlanLimitModal;

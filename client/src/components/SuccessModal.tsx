import React from 'react';
import { CheckCircle, X, AlertCircle } from 'lucide-react';
import './SuccessModal.css';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  type?: 'success' | 'error';
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK',
  type = 'success'
}) => {
  if (!isOpen) return null;

  const isError = type === 'error';
  const iconColor = isError ? '#ef4444' : '#10b981';
  const IconComponent = isError ? AlertCircle : CheckCircle;

  return (
    <div className="success-modal-overlay">
      <div className="success-modal-container">
        <div className="success-modal-content">
          {/* Ícone de sucesso ou erro */}
          <div className="success-modal-icon">
            <IconComponent size={48} color={iconColor} />
          </div>
          
          {/* Título */}
          <h2 className="success-modal-title">
            {title}
          </h2>
          
          {/* Mensagem */}
          <p className="success-modal-message">
            {message}
          </p>
          
          {/* Botão de fechar */}
          <button
            onClick={onClose}
            className="success-modal-button"
          >
            {buttonText}
          </button>
          
          {/* Botão X no canto superior direito */}
          <button
            onClick={onClose}
            className="success-modal-close"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Target, Save, X } from 'lucide-react';
import './NewStudent.css';
import SuccessModal from './SuccessModal';

interface NewStudentForm {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const NewStudent: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<NewStudentForm>({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<NewStudentForm>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);



  const validateForm = (): boolean => {
    const newErrors: Partial<NewStudentForm> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Usar a API real tanto em desenvolvimento quanto em produção
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? '/api/students' 
        : '/.netlify/functions/api/students';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone
          // personalId vem automaticamente do token JWT
        }),
      });

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao cadastrar aluno');
      }
         } catch (error) {
       alert('Erro ao cadastrar aluno');
     } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof NewStudentForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/dashboard/students');
  };

  return (
    <div className="new-student-container">
      {/* Header */}
      <div className="new-student-header">
        <Link
          to="/dashboard/students"
          className="new-student-back-link"
          style={{
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '0.875rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#e2e8f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <ArrowLeft size={16} />
          Voltar aos Alunos
        </Link>
      </div>

      {/* Título */}
      <div style={{
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div className="new-student-icon" style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
          marginBottom: '1rem'
        }}>
          <User size={24} color="white" />
        </div>
        <h1 className="new-student-title" style={{
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '0.5rem'
        }}>
          Adicionar Novo Aluno
        </h1>
        <p className="new-student-subtitle" style={{
          color: '#94a3b8'
        }}>
          Preencha os dados do novo aluno. O código de acesso será gerado automaticamente.
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="new-student-form" style={{
        backgroundColor: 'rgba(2, 6, 23, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '1rem'
      }}>
        {/* Nome */}
        <div className="new-student-form-group">
          <label className="new-student-label" style={{
            display: 'block',
            color: 'white',
            fontWeight: '500'
          }}>
            Nome Completo *
          </label>
                      <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              autoComplete="name"
              className="new-student-input"
              style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: `1px solid ${errors.name ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)'}`,
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '1rem',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = errors.name ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.6)';
              e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.name ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)';
              e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
            }}
            placeholder="Digite o nome completo"
          />
          {errors.name && (
            <div className="new-student-error" style={{
              color: '#fca5a5'
            }}>
              <X size={12} />
              {errors.name}
            </div>
          )}
        </div>



        {/* Email */}
        <div className="new-student-form-group">
          <label className="new-student-label" style={{
            display: 'block',
            color: 'white',
            fontWeight: '500'
          }}>
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            autoComplete="email"
            className="new-student-input"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: `1px solid ${errors.email ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)'}`,
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '1rem',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = errors.email ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.6)';
              e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.email ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)';
              e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
            }}
            placeholder="Digite o email do aluno (opcional)"
          />
          {errors.email && (
            <div className="new-student-error" style={{
              color: '#fca5a5'
            }}>
              <X size={12} />
              {errors.email}
            </div>
          )}
        </div>

        {/* Telefone */}
        <div className="new-student-form-group">
          <label className="new-student-label" style={{
            display: 'block',
            color: 'white',
            fontWeight: '500'
          }}>
            Telefone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            autoComplete="tel"
            className="new-student-input"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '1rem',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
              e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
              e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
            }}
            placeholder="Digite o telefone do aluno (opcional)"
          />
        </div>

        {/* Observações */}
        <div className="new-student-form-group">
          <label className="new-student-label" style={{
            display: 'block',
            color: 'white',
            fontWeight: '500'
          }}>
            Observações
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="new-student-textarea"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '1rem',
              transition: 'all 0.3s',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
              e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
              e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
            }}
            placeholder="Informações adicionais sobre o aluno (opcional)"
          />
        </div>

        {/* Botões */}
        <div className="new-student-actions" style={{
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <Link
            to="/dashboard/students"
            className="new-student-cancel-link"
            style={{
              border: '1px solid rgba(148, 163, 184, 0.3)',
              color: '#94a3b8',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
            }}
          >
            Cancelar
          </Link>
          
          <button
            type="submit"
            disabled={loading}
            className="new-student-submit-btn"
            style={{
              background: loading 
                ? 'rgba(59, 130, 246, 0.3)' 
                : 'linear-gradient(135deg, #3b82f6, #1e40af)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {loading ? (
              <>
                <div className="new-student-loading-spinner"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} />
                Salvar Aluno
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Aluno Cadastrado!"
        message="O novo aluno foi cadastrado com sucesso. O código de acesso foi gerado automaticamente e pode ser visualizado na lista de alunos."
        buttonText="Ver Alunos"
      />
    </div>
  );
};

export default NewStudent;

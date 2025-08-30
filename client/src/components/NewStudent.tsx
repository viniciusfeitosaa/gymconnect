import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Target, Save, X } from 'lucide-react';
import './NewStudent.css';

interface NewStudentForm {
  name: string;
  accessCode: string;
  notes: string;
}

const NewStudent: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<NewStudentForm>({
    name: '',
    accessCode: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<NewStudentForm>>({});

  const generateAccessCode = () => {
    // Gerar código baseado no nome
    const nameParts = formData.name.trim().split(' ');
    if (nameParts.length >= 2) {
      const firstName = nameParts[0].substring(0, 3).toUpperCase();
      const lastName = nameParts[nameParts.length - 1].substring(0, 3).toUpperCase();
      const randomNum = Math.floor(Math.random() * 999) + 1;
      const code = `${firstName}${lastName}${randomNum.toString().padStart(3, '0')}`;
      setFormData(prev => ({ ...prev, accessCode: code }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<NewStudentForm> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.accessCode.trim()) {
      newErrors.accessCode = 'Código de acesso é obrigatório';
    } else if (formData.accessCode.length < 3) {
      newErrors.accessCode = 'Código deve ter pelo menos 3 caracteres';
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
          accessCode: formData.accessCode,
          notes: formData.notes,
          joinDate: new Date().toISOString().split('T')[0],
          status: 'active'
          // personalId vem automaticamente do token JWT
        }),
      });

      if (response.ok) {
        alert('Aluno cadastrado com sucesso!');
        navigate('/dashboard/students');
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
          Preencha os dados do novo aluno
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



        {/* Código de Acesso */}
        <div className="new-student-form-group">
          <label className="new-student-label" style={{
            display: 'block',
            color: 'white',
            fontWeight: '500'
          }}>
            Código de Acesso *
          </label>
          <div className="new-student-code-section" style={{
            display: 'flex'
          }}>
            <input
              type="text"
              value={formData.accessCode}
              onChange={(e) => handleInputChange('accessCode', e.target.value.toUpperCase())}
              autoComplete="off"
              className="new-student-input new-student-code-input"
              style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: `1px solid ${errors.accessCode ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)'}`,
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '1rem',
                fontFamily: 'monospace',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = errors.accessCode ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.6)';
                e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.accessCode ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)';
                e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
              }}
              placeholder="Ex: ANA001"
            />
            <button
              type="button"
              onClick={generateAccessCode}
              className="new-student-generate-btn"
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
              }}
            >
              <Target size={16} />
              Gerar
            </button>
          </div>
          {errors.accessCode && (
            <div className="new-student-error" style={{
              color: '#fca5a5'
            }}>
              <X size={12} />
              {errors.accessCode}
            </div>
          )}
          <p className="new-student-help-text" style={{
            color: '#64748b'
          }}>
            Este código será usado pelo aluno para acessar seus treinos
          </p>
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
    </div>
  );
};

export default NewStudent;

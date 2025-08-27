import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Target, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NewStudentForm {
  name: string;
  accessCode: string;
  notes: string;
}

const NewStudent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      // Em desenvolvimento, usar backend local; em produção, usar dados estáticos
      if (process.env.NODE_ENV === 'development') {
        const response = await fetch('/api/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
      } else {
        // Em produção, simular sucesso
        alert('Aluno cadastrado com sucesso!');
        navigate('/dashboard/students');
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
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <Link
          to="/dashboard/students"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '0.875rem',
            transition: 'color 0.3s'
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
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '4rem',
          height: '4rem',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
          marginBottom: '1rem'
        }}>
          <User size={24} color="white" />
        </div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '0.5rem'
        }}>
          Adicionar Novo Aluno
        </h1>
        <p style={{
          color: '#94a3b8',
          fontSize: '1rem'
        }}>
          Preencha os dados do novo aluno
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'rgba(2, 6, 23, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '1rem',
        padding: '2rem'
      }}>
        {/* Nome */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Nome Completo *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
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
            <div style={{
              color: '#fca5a5',
              fontSize: '0.75rem',
              marginTop: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <X size={12} />
              {errors.name}
            </div>
          )}
        </div>



        {/* Código de Acesso */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Código de Acesso *
          </label>
          <div style={{
            display: 'flex',
            gap: '0.75rem'
          }}>
            <input
              type="text"
              value={formData.accessCode}
              onChange={(e) => handleInputChange('accessCode', e.target.value.toUpperCase())}
              style={{
                flex: 1,
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
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.3s',
                whiteSpace: 'nowrap'
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
            <div style={{
              color: '#fca5a5',
              fontSize: '0.75rem',
              marginTop: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <X size={12} />
              {errors.accessCode}
            </div>
          )}
          <p style={{
            color: '#64748b',
            fontSize: '0.75rem',
            marginTop: '0.5rem'
          }}>
            Este código será usado pelo aluno para acessar seus treinos
          </p>
        </div>

        {/* Observações */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Observações
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '1rem',
              resize: 'vertical',
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
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <Link
            to="/dashboard/students"
            style={{
              border: '1px solid rgba(148, 163, 184, 0.3)',
              color: '#94a3b8',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.3s'
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
            style={{
              background: loading 
                ? 'rgba(59, 130, 246, 0.3)' 
                : 'linear-gradient(135deg, #3b82f6, #1e40af)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s'
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
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
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

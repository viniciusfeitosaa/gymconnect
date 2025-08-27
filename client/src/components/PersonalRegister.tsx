import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Save, X } from 'lucide-react';

interface PersonalRegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const PersonalRegister: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PersonalRegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<PersonalRegisterForm>>({});
  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (password: string): boolean => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (!hasUpperCase) {
      setPasswordError('A senha deve conter pelo menos uma letra maiúscula');
      return false;
    }
    
    if (!hasSpecialChar) {
      setPasswordError('A senha deve conter pelo menos um caractere especial');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PersonalRegisterForm> = {};
    setPasswordError('');

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Senha não atende aos critérios de segurança';
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
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
      if (process.env.NODE_ENV === 'development') {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password
          }),
        });

        if (response.ok) {
          alert('Personal registrado com sucesso! Faça login para continuar.');
          navigate('/login');
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Erro ao registrar personal');
        }
      } else {
        alert('Personal registrado com sucesso! Faça login para continuar.');
        navigate('/login');
      }
    } catch (error) {
      alert('Erro ao registrar personal');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PersonalRegisterForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '500px',
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
          to="/login"
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
          Voltar ao Login
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
          Registro de Personal
        </h1>
        <p style={{
          color: '#94a3b8',
          fontSize: '1rem'
        }}>
          Crie sua conta para começar a gerenciar alunos
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
            placeholder="Seu nome completo"
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

        {/* Email */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
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
            placeholder="seu@email.com"
          />
          {errors.email && (
            <div style={{
              color: '#fca5a5',
              fontSize: '0.75rem',
              marginTop: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <X size={12} />
              {errors.email}
            </div>
          )}
        </div>

        {/* Senha */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Senha *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => {
              handleInputChange('password', e.target.value);
              if (passwordError) {
                validatePassword(e.target.value);
              }
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: `1px solid ${passwordError ? 'rgba(239, 68, 68, 0.5)' : errors.password ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)'}`,
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '1rem',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = passwordError ? 'rgba(239, 68, 68, 0.7)' : errors.password ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.6)';
              e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = passwordError ? 'rgba(239, 68, 68, 0.5)' : errors.password ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)';
              e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
            }}
            placeholder="Mínimo 6 caracteres, maiúscula e caractere especial"
          />
          {passwordError && (
            <div style={{
              color: '#fca5a5',
              fontSize: '0.75rem',
              marginTop: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <X size={12} />
              {passwordError}
            </div>
          )}
          
          {errors.password && !passwordError && (
            <div style={{
              color: '#fca5a5',
              fontSize: '0.75rem',
              marginTop: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <X size={12} />
              {errors.password}
            </div>
          )}
          
          {/* Indicador de força da senha */}
          {formData.password && !passwordError && !errors.password && (
            <div style={{
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                color: '#10b981',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                Senha segura
              </span>
            </div>
          )}
        </div>

        {/* Confirmar Senha */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Confirmar Senha *
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: `1px solid ${errors.confirmPassword ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)'}`,
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '1rem',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = errors.confirmPassword ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.6)';
              e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.confirmPassword ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)';
              e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
            }}
            placeholder="Digite a senha novamente"
          />
          {errors.confirmPassword && (
            <div style={{
              color: '#fca5a5',
              fontSize: '0.75rem',
              marginTop: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <X size={12} />
              {errors.confirmPassword}
            </div>
          )}
        </div>

        {/* Botão de Registro */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: loading 
              ? 'rgba(59, 130, 246, 0.3)' 
              : 'linear-gradient(135deg, #3b82f6, #1e40af)',
            color: 'white',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
              Registrando...
            </>
          ) : (
            <>
              <Save size={16} />
              Criar Conta
            </>
          )}
        </button>

        {/* Link para Login */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <p style={{
            color: '#94a3b8',
            fontSize: '0.875rem',
            marginBottom: '0.5rem'
          }}>
            Já tem uma conta?
          </p>
          <Link
            to="/login"
            style={{
              color: '#60a5fa',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'color 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#93c5fd';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#60a5fa';
            }}
          >
            Faça login aqui
          </Link>
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

export default PersonalRegister;

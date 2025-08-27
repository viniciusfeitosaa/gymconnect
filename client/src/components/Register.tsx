import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Dumbbell, Users, Search, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

const Register: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'aluno'>('personal');
  
  // Estados para Personal
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Estados para Aluno
  const [accessCode, setAccessCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = (password: string): { level: 'fraca' | 'boa' | 'forte', score: number, color: string } => {
    let score = 0;
    
    // Comprimento mínimo
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Letras maiúsculas
    if (/[A-Z]/.test(password)) score += 1;
    
    // Letras minúsculas
    if (/[a-z]/.test(password)) score += 1;
    
    // Números
    if (/[0-9]/.test(password)) score += 1;
    
    // Caracteres especiais
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 1;
    
    // Variação de caracteres
    if (password.length > 0) {
      const uniqueChars = new Set(password).size;
      if (uniqueChars >= 6) score += 1;
    }
    
    // Bônus por comprimento extra longo
    if (password.length >= 16) score += 1;
    
    if (score <= 2) return { level: 'fraca', score, color: '#ef4444' };
    if (score <= 5) return { level: 'boa', score, color: '#f59e0b' };
    return { level: 'forte', score, color: '#10b981' };
  };

  const validatePassword = (password: string): boolean => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    
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

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPasswordError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError('Senha não atende aos critérios de segurança');
      setLoading(false);
      return;
    }

    // Verificar se a senha é pelo menos "boa"
    const strength = getPasswordStrength(password);
    if (strength.level === 'fraca') {
      setError('Sua senha é muito fraca. Melhore-a para continuar.');
      setLoading(false);
      return;
    }

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleAlunoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!accessCode.trim()) {
      setError('Por favor, insira o código de acesso');
      setLoading(false);
      return;
    }

    try {
      // Simular verificação do código
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirecionar para a página de treinos do aluno
      navigate(`/student-workouts/${accessCode}`);
    } catch (err: any) {
      setError('Código de acesso inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020617 0%, #0c1421 25%, #1e293b 50%, #0c1421 75%, #020617 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
        animation: 'pulse 4s ease-in-out infinite alternate'
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '-50%',
        left: '-50%',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(30, 58, 138, 0.08) 0%, transparent 70%)',
        animation: 'pulse 4s ease-in-out infinite alternate-reverse'
      }}></div>

      <div className="register-container" style={{
        width: '100%',
        maxWidth: '500px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '4rem',
            height: '4rem',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
            marginBottom: '1rem',
            boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
          }}>
            <Dumbbell size={32} color="white" />
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #ffffff, #93c5fd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            GymConnect
          </h1>
          <p style={{
            color: '#e2e8f0',
            fontSize: '1rem'
          }}>
            Escolha como você quer acessar
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          borderRadius: '1rem',
          padding: '0.25rem',
          marginBottom: '2rem',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          <button
            onClick={() => setActiveTab('personal')}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              background: activeTab === 'personal' 
                ? 'linear-gradient(135deg, #3b82f6, #1e40af)' 
                : 'transparent',
              color: activeTab === 'personal' ? 'white' : '#94a3b8',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Users size={18} />
            Personal Trainer
          </button>
          <button
            onClick={() => setActiveTab('aluno')}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              background: activeTab === 'aluno' 
                ? 'linear-gradient(135deg, #3b82f6, #1e40af)' 
                : 'transparent',
              color: activeTab === 'aluno' ? 'white' : '#94a3b8',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Key size={18} />
            Aluno
          </button>
        </div>

        {/* Form Container */}
        <div className="register-form" style={{
          backgroundColor: 'rgba(2, 6, 23, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)',
          padding: '2rem'
        }}>
          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#fca5a5',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Personal Trainer Form */}
          {activeTab === 'personal' && (
            <form onSubmit={handlePersonalSubmit}>
              <h2 style={{
                color: '#f1f5f9',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                Criar Conta de Personal
              </h2>
              
              {/* Name Field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  color: '#f1f5f9',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Nome Completo
                </label>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    color: '#64748b'
                  }}>
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 3rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      borderRadius: '0.75rem',
                      color: 'white',
                      fontSize: '1rem',
                      transition: 'all 0.3s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.7)';
                      e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                      e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
                    }}
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  color: '#f1f5f9',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Email
                </label>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    color: '#64748b'
                  }}>
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 3rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      borderRadius: '0.75rem',
                      color: 'white',
                      fontSize: '1rem',
                      transition: 'all 0.3s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.7)';
                      e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                      e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
                    }}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  color: '#f1f5f9',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Senha
                </label>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    color: '#64748b'
                  }}>
                    <Lock size={20} />
                  </div>
                                  <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) {
                      validatePassword(e.target.value);
                    }
                  }}
                  required
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 3rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: `1px solid ${passwordError ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.4)'}`,
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontSize: '1rem',
                    transition: 'all 0.3s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = passwordError ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.7)';
                    e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = passwordError ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.4)';
                    e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
                  }}
                  placeholder="Digite uma senha forte (mínimo 6 caracteres)"
                />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {/* Mensagens de erro da senha */}
                {passwordError && (
                  <div style={{
                    color: '#fca5a5',
                    fontSize: '0.75rem',
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    {passwordError}
                  </div>
                )}
                
                {/* Indicador de força da senha em níveis */}
                {password && (
                  <div style={{
                    marginTop: '0.75rem'
                  }}>
                    {/* Barra de progresso */}
                    <div style={{
                      width: '100%',
                      height: '4px',
                      backgroundColor: 'rgba(15, 23, 42, 0.5)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      marginBottom: '0.5rem'
                    }}>
                                             <div style={{
                         width: `${Math.min((getPasswordStrength(password).score / 8) * 100, 100)}%`,
                         height: '100%',
                         backgroundColor: getPasswordStrength(password).color,
                         borderRadius: '2px',
                         transition: 'all 0.3s ease'
                       }}></div>
                    </div>
                    
                    {/* Texto e ícone da força */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem'
                    }}>
                      <span style={{
                        color: getPasswordStrength(password).color,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontWeight: '500'
                      }}>
                        {getPasswordStrength(password).level === 'fraca' && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                          </svg>
                        )}
                        {getPasswordStrength(password).level === 'boa' && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="8" y1="12" x2="11" y2="15"></line>
                            <line x1="11" y1="15" x2="16" y2="9"></line>
                          </svg>
                        )}
                        {getPasswordStrength(password).level === 'forte' && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6 9 17l-5-5"></path>
                          </svg>
                        )}
                        Senha {getPasswordStrength(password).level}
                      </span>
                      
                                             {/* Score numérico */}
                       <span style={{
                         color: '#64748b',
                         fontSize: '0.7rem'
                       }}>
                         {getPasswordStrength(password).score}/8
                       </span>
                    </div>
                    
                    {/* Dicas de melhoria */}
                    {getPasswordStrength(password).level === 'fraca' && (
                      <div style={{
                        color: '#fca5a5',
                        fontSize: '0.7rem',
                        marginTop: '0.25rem',
                        lineHeight: '1.3'
                      }}>
                        💡 Dica: Adicione números, letras minúsculas e mais caracteres especiais
                      </div>
                    )}
                    {getPasswordStrength(password).level === 'boa' && (
                      <div style={{
                        color: '#fbbf24',
                        fontSize: '0.7rem',
                        marginTop: '0.25rem',
                        lineHeight: '1.3'
                      }}>
                        💡 Dica: Aumente o comprimento para tornar a senha mais forte
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  color: '#f1f5f9',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Confirmar Senha
                </label>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    color: '#64748b'
                  }}>
                    <Lock size={20} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 3rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      borderRadius: '0.75rem',
                      color: 'white',
                      fontSize: '1rem',
                      transition: 'all 0.3s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.7)';
                      e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                      e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
                    }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
                  }
                }}
              >
                {loading ? 'Criando conta...' : 'Criar Conta de Personal'}
              </button>
            </form>
          )}

          {/* Aluno Form */}
          {activeTab === 'aluno' && (
            <form onSubmit={handleAlunoSubmit}>
              <h2 style={{
                color: '#f1f5f9',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                Acessar como Aluno
              </h2>
              
              <p style={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                textAlign: 'center',
                marginBottom: '2rem',
                lineHeight: '1.5'
              }}>
                Digite o código de acesso fornecido pelo seu personal trainer
              </p>

              {/* Access Code Field */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  fontWeight: '500',
                  marginBottom: '0.75rem',
                  textAlign: 'center'
                }}>
                  Código de Acesso
                </label>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    color: '#64748b'
                  }}>
                    <Search size={24} />
                  </div>
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 3.5rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      borderRadius: '1rem',
                      color: 'white',
                      fontSize: '1.125rem',
                      textAlign: 'center',
                      letterSpacing: '0.1em',
                      transition: 'all 0.3s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.7)';
                      e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                      e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
                    }}
                    placeholder="Ex: ABC123"
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '1rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 15px 35px rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.3)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Verificando...
                  </>
                ) : (
                  <>
                    <Dumbbell size={20} />
                    Acessar Treinos
                  </>
                )}
              </button>
            </form>
          )}

          {/* Links */}
          <div style={{
            marginTop: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#94a3b8',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              Já tem uma conta?{' '}
              <Link
                to="/login"
                style={{
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#60a5fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#3b82f6';
                }}
              >
                Faça login
              </Link>
            </p>
            
            <Link
              to="/"
              style={{
                color: '#64748b',
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#94a3b8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#64748b';
              }}
            >
              Voltar para página inicial
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.2; }
          100% { opacity: 0.4; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Register;

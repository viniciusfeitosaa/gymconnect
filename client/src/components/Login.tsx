import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Dumbbell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
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

      <div className="login-container" style={{
        width: '100%',
        maxWidth: '400px',
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
            Faça login para acessar sua conta
          </p>
        </div>

        {/* Form */}
        <div className="login-form" style={{
          backgroundColor: 'rgba(2, 6, 23, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)'
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

          <form onSubmit={handleSubmit}>
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
            <div style={{ marginBottom: '2rem' }}>
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
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
                    e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
                  }}
                  placeholder="••••••••"
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
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Links */}
          <div style={{
            marginTop: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#94a3b8',
              fontSize: '0.875rem',
              marginBottom: '0.5rem'
            }}>
              Não tem uma conta?{' '}
              <Link
                to="/register"
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
                Cadastre-se
              </Link>
            </p>
            

            
            <Link
              to="/student-access"
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
              Acessar treino como aluno
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.2; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default Login;

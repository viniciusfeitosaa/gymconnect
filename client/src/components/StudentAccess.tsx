import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Dumbbell, Smartphone } from 'lucide-react';

const StudentAccess: React.FC = () => {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      setError('Por favor, insira o código de acesso');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simular verificação do código
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirecionar para a página de treinos do aluno
      navigate(`/student-workouts/${accessCode}`);
    } catch (err) {
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

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          background: 'rgba(2, 6, 23, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '0.75rem',
          padding: '0.75rem',
          color: '#e2e8f0',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.3s',
          zIndex: 20
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
          e.currentTarget.style.backgroundColor = 'rgba(2, 6, 23, 0.98)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
          e.currentTarget.style.backgroundColor = 'rgba(2, 6, 23, 0.95)';
        }}
      >
        <ArrowLeft size={20} />
        Voltar
      </button>

      <div style={{
        width: '100%',
        maxWidth: '500px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '5rem',
            height: '5rem',
            borderRadius: '1.5rem',
            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
            marginBottom: '1.5rem',
            boxShadow: '0 25px 50px rgba(59, 130, 246, 0.3)'
          }}>
            <Smartphone size={40} color="white" />
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #ffffff, #93c5fd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>
            Acessar Treino
          </h1>
          <p style={{
            color: '#e2e8f0',
            fontSize: '1.125rem',
            lineHeight: '1.6',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            Digite o código de acesso fornecido pelo seu personal trainer para visualizar seus treinos
          </p>
        </div>

        {/* Form */}
        <div style={{
          backgroundColor: 'rgba(2, 6, 23, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)'
        }}>
          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '2rem',
              color: '#fca5a5',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
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

          {/* Info */}
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '1rem',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#93c5fd',
              fontSize: '0.875rem',
              lineHeight: '1.5'
            }}>
              💡 <strong>Dica:</strong> O código de acesso é fornecido pelo seu personal trainer. 
              Se você não tiver um código, entre em contato com ele.
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div style={{
          marginTop: '2rem',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#64748b',
            fontSize: '0.875rem'
          }}>
            Precisa de ajuda? Entre em contato com seu personal trainer
          </p>
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

export default StudentAccess;

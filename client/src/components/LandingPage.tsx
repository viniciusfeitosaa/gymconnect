import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Users, ArrowRight } from 'lucide-react';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020617 0%, #0c1421 25%, #1e293b 50%, #0c1421 75%, #020617 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header className="landing-header" style={{
        backgroundColor: 'rgba(2, 6, 23, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Dumbbell size={32} color="white" />
            </div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #ffffff, #93c5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              GymConnect
            </h1>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <Link
              to="/login"
              style={{
                color: '#e2e8f0',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#e2e8f0';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Entrar
            </Link>
            <Link
              to="/register"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                color: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Cadastrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-main" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#93c5fd',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '2rem'
          }}>
            <span style={{ marginRight: '0.5rem' }}>⚡</span>
            Plataforma #1 para Personal Trainers
          </div>
          
          <h1 className="landing-hero" style={{
            fontWeight: '800',
            lineHeight: '1.2',
            marginBottom: '2rem'
          }}>
            <span style={{
              display: 'block',
              background: 'linear-gradient(135deg, #ffffff, #93c5fd, #60a5fa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Conecte-se com seus
            </span>
            <span style={{
              display: 'block',
              background: 'linear-gradient(135deg, #60a5fa, #3b82f6, #1e40af)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              alunos de forma simples
            </span>
          </h1>
          
          <p className="landing-hero" style={{
            color: '#e2e8f0',
            maxWidth: '768px',
            margin: '0 auto 2.5rem',
            lineHeight: '1.6'
          }}>
            Plataforma completa e intuitiva para personal trainers gerenciarem alunos e treinos. 
            Seus alunos acessam os treinos com um código simples, sem complicações.
          </p>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Link
              to="/register"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                fontSize: '1.125rem',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Começar Agora
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/student-access"
              style={{
                border: '2px solid rgba(59, 130, 246, 0.3)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                fontSize: '1.125rem',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Acessar Treino
              <span style={{ fontSize: '1.25rem' }}>📱</span>
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            maxWidth: '600px',
            margin: '4rem auto 0'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>500+</div>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Personal Trainers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>10k+</div>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Alunos Atendidos</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>50k+</div>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Treinos Criados</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="landing-features">
          <div style={{ textAlign: 'center' }}>
            <h2 className="landing-features" style={{
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '1rem'
            }}>
              Por que escolher o GymConnect?
            </h2>
            <p className="landing-features" style={{
              color: '#e2e8f0',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Ferramentas poderosas para transformar sua carreira como personal trainer
            </p>
          </div>
          
          <div className="landing-features-grid" style={{
            display: 'grid'
          }}>
            {/* Feature 1 */}
            <div className="landing-feature-card" style={{
              backgroundColor: 'rgba(2, 6, 23, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '1rem',
              textAlign: 'center',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
              e.currentTarget.style.transform = 'translateY(-8px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '4rem',
                height: '4rem',
                borderRadius: '1rem',
                background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                margin: '0 auto 1.5rem'
              }}>
                <Dumbbell size={32} color="white" />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '1rem'
              }}>
                Gestão de Treinos
              </h3>
              <p style={{
                color: '#e2e8f0',
                lineHeight: '1.6'
              }}>
                Crie e organize treinos personalizados para cada aluno com exercícios detalhados, séries, repetições e observações.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="landing-feature-card" style={{
              backgroundColor: 'rgba(2, 6, 23, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '1rem',
              textAlign: 'center',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
              e.currentTarget.style.transform = 'translateY(-8px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '4rem',
                height: '4rem',
                borderRadius: '1rem',
                background: 'linear-gradient(135deg, #1e40af, #1e293b)',
                margin: '0 auto 1.5rem'
              }}>
                <Users size={32} color="white" />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '1rem'
              }}>
                Controle de Alunos
              </h3>
              <p style={{
                color: '#e2e8f0',
                lineHeight: '1.6'
              }}>
                Adicione alunos, gere códigos de acesso únicos e acompanhe o progresso de cada um de forma organizada.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="landing-feature-card" style={{
              backgroundColor: 'rgba(2, 6, 23, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '1rem',
              textAlign: 'center',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
              e.currentTarget.style.transform = 'translateY(-8px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '4rem',
                height: '4rem',
                borderRadius: '1rem',
                background: 'linear-gradient(135deg, #1e293b, #0c1421)',
                margin: '0 auto 1.5rem'
              }}>
                <span style={{ fontSize: '2rem' }}>🛡️</span>
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '1rem'
              }}>
                Acesso Simples
              </h3>
              <p style={{
                color: '#e2e8f0',
                lineHeight: '1.6'
              }}>
                Seus alunos acessam os treinos através de um código simples, sem necessidade de cadastro ou login.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="landing-cta" style={{ 
          position: 'relative'
        }}>
          <div className="cta-container" style={{
            backgroundColor: 'rgba(2, 6, 23, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '1.5rem',
            textAlign: 'center'
          }}>
            <h2 className="landing-cta" style={{
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '1.5rem'
            }}>
              Pronto para transformar sua carreira?
            </h2>
            <p className="landing-cta" style={{
              color: '#e2e8f0',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem'
            }}>
              Junte-se a centenas de personal trainers que já estão usando o GymConnect para revolucionar seus negócios
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Link
                to="/register"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Criar Conta Gratuita
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/student-access"
                style={{
                  border: '2px solid rgba(59, 130, 246, 0.3)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.75rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Acessar Treino
                <span style={{ fontSize: '1.25rem' }}>📱</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer" style={{
        backgroundColor: 'rgba(2, 6, 23, 0.9)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem', 
          textAlign: 'center' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.75rem', 
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
              padding: '0.5rem',
              borderRadius: '0.5rem'
            }}>
              <Dumbbell size={24} color="white" />
            </div>
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #ffffff, #93c5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              GymConnect
            </span>
          </div>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            Conectando personal trainers e alunos de forma simples e eficiente
          </p>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            © 2024 GymConnect. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

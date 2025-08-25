import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Routes, Route } from 'react-router-dom';
import { LogOut, Plus, Users, Dumbbell, BarChart3, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import StudentsList from './StudentsList';
import CreateWorkout from './CreateWorkout';
import WorkoutsList from './WorkoutsList';

// Componente da página inicial do dashboard
interface Student {
  id: string;
  name: string;
  accessCode: string;
}

interface Stats {
  totalStudents: number;
  totalWorkouts: number;
  recentStudents: Student[];
}

const DashboardHome: React.FC = () => {
  // const { user } = useAuth(); // Removido temporariamente
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalWorkouts: 0,
    recentStudents: []
  });

  useEffect(() => {
    // Mock data - substitua por chamadas reais da API
    setStats({
      totalStudents: 12,
      totalWorkouts: 48,
      recentStudents: [
        { id: '1', name: 'João Silva', accessCode: 'ABC123' },
        { id: '2', name: 'Maria Santos', accessCode: 'DEF456' },
        { id: '3', name: 'Pedro Costa', accessCode: 'GHI789' }
      ]
    });
  }, []);

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header da página inicial */}
      <div style={{
        marginBottom: '3rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #ffffff, #93c5fd)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}>
          Bem-vindo ao seu Dashboard
        </h1>
        <p style={{
          color: '#e2e8f0',
          fontSize: '1.125rem'
        }}>
          Gerencie seus alunos e treinos de forma simples e eficiente
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {/* Card Total de Alunos */}
        <div style={{
          backgroundColor: 'rgba(2, 6, 23, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
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
            <Users size={24} color="white" />
          </div>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            {stats.totalStudents}
          </div>
          <div style={{
            color: '#94a3b8',
            fontSize: '1rem'
          }}>
            Total de Alunos
          </div>
        </div>

        {/* Card Total de Treinos */}
        <div style={{
          backgroundColor: 'rgba(2, 6, 23, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '4rem',
            height: '4rem',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, #1e40af, #1e293b)',
            marginBottom: '1rem'
          }}>
            <Dumbbell size={24} color="white" />
          </div>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            {stats.totalWorkouts}
          </div>
          <div style={{
            color: '#94a3b8',
            fontSize: '1rem'
          }}>
            Total de Treinos
          </div>
        </div>
      </div>

      {/* Seção de alunos recentes */}
      <div style={{
        backgroundColor: 'rgba(2, 6, 23, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '1rem',
        padding: '2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white'
          }}>
            Alunos Recentes
          </h2>
          <Link
            to="/dashboard/students"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
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
            Ver Todos
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {stats.recentStudents.map((student) => (
            <div
              key={student.id}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '0.75rem',
                padding: '1rem',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
              }}
            >
              <div style={{
                color: 'white',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                {student.name}
              </div>
              <div style={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                fontFamily: 'monospace'
              }}>
                Código: {student.accessCode}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ações rápidas */}
      <div style={{
        marginTop: '3rem',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: 'white',
          marginBottom: '1.5rem'
        }}>
          Ações Rápidas
        </h3>
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link
            to="/dashboard/students/new"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              fontWeight: '600',
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
            <Plus size={20} />
            Adicionar Aluno
          </Link>
          
          <Link
            to="/dashboard/workouts/new"
            style={{
              border: '2px solid rgba(59, 130, 246, 0.3)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              fontWeight: '600',
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
            <Dumbbell size={20} />
            Criar Treino
          </Link>
        </div>
      </div>
    </div>
  );
};

const PersonalDashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020617 0%, #0c1421 25%, #1e293b 50%, #0c1421 75%, #020617 100%)',
      color: 'white'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'rgba(2, 6, 23, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
        padding: '1rem 2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <button
              onClick={toggleSidebar}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Menu size={24} />
            </button>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                padding: '0.5rem',
                borderRadius: '0.5rem'
              }}>
                <Dumbbell size={24} color="white" />
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
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </header>

      <div style={{
        display: 'flex',
        minHeight: 'calc(100vh - 80px)'
      }}>
        {/* Sidebar */}
        <div style={{
          width: sidebarOpen ? '280px' : '0',
          backgroundColor: 'rgba(2, 6, 23, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(59, 130, 246, 0.3)',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          position: 'fixed',
          left: 0,
          top: '80px',
          height: 'calc(100vh - 80px)',
          zIndex: 1000
        }}>
          <div style={{
            padding: '2rem 1.5rem',
            width: '280px'
          }}>
            <nav style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <Link
                to="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  color: '#e2e8f0',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#e2e8f0';
                }}
              >
                <BarChart3 size={20} />
                Dashboard
              </Link>
              
              <Link
                to="/dashboard/students"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  color: '#e2e8f0',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#e2e8f0';
                }}
              >
                <Users size={20} />
                Alunos
              </Link>
              
              <Link
                to="/dashboard/workouts"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  color: '#e2e8f0',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#e2e8f0';
                }}
              >
                <Dumbbell size={20} />
                Treinos
              </Link>
            </nav>
          </div>
        </div>

        {/* Overlay para fechar sidebar em mobile */}
        {sidebarOpen && (
          <div
            onClick={toggleSidebar}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999
            }}
          />
        )}

        {/* Conteúdo principal */}
        <main style={{
          flex: 1,
          marginLeft: sidebarOpen ? '280px' : '0',
          transition: 'margin-left 0.3s ease'
        }}>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/students" element={<StudentsList />} />
            <Route path="/students/new" element={<CreateWorkout />} />
            <Route path="/workouts" element={<WorkoutsList />} />
            <Route path="/workouts/new" element={<CreateWorkout />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default PersonalDashboard;

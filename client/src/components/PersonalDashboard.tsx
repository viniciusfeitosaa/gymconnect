import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Routes, Route } from 'react-router-dom';
import { LogOut, Plus, Users, Dumbbell, BarChart3, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import StudentsList from './StudentsList';
// CreateWorkout não utilizado mais
import WorkoutsList from './WorkoutsList';
import NewStudent from './NewStudent';
import NewWorkout from './NewWorkout';
import './PersonalDashboard.css';

// Componente da página inicial do dashboard
interface Student {
  id: string;
  name: string;
  accessCode: string;
  workoutCount?: number;
}

interface Stats {
  totalStudents: number;
  totalWorkouts: number;
  recentStudents: Student[];
  message?: string;
}

const DashboardHome: React.FC = () => {
  // const { user } = useAuth(); // Removido temporariamente
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalWorkouts: 0,
    recentStudents: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Em desenvolvimento, usar backend local; em produção, usar dados estáticos
        if (process.env.NODE_ENV === 'development') {
          const response = await fetch('/api/dashboard/stats');
          if (response.ok) {
            const data = await response.json();
            setStats(data);
          } else {
            // Fallback para dados estáticos
            loadStaticStats();
          }
        } else {
          // Em produção, usar dados estáticos
          loadStaticStats();
        }
             } catch (error) {
         // Fallback para dados estáticos
         loadStaticStats();
       }
    };

    const loadStaticStats = () => {
      setStats({
        totalStudents: 0,
        totalWorkouts: 0,
        recentStudents: [],
        message: "Você ainda não tem alunos cadastrados. Comece adicionando seu primeiro aluno!"
      });
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container" style={{
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header da página inicial */}
      <div style={{
        marginBottom: '3rem',
        textAlign: 'center'
      }}>
        <h1 className="dashboard-title" style={{
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
      <div className="dashboard-stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {/* Card Total de Alunos */}
        <div className="dashboard-stat-card" style={{
          backgroundColor: 'rgba(2, 6, 23, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '1rem',
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
            background: stats.totalStudents > 0 
              ? 'linear-gradient(135deg, #3b82f6, #1e40af)'
              : 'linear-gradient(135deg, #6b7280, #4b5563)',
            marginBottom: '1rem'
          }}>
            <Users size={24} color="white" />
          </div>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: stats.totalStudents > 0 ? 'white' : '#9ca3af',
            marginBottom: '0.5rem'
          }}>
            {stats.totalStudents}
          </div>
          <div style={{
            color: stats.totalStudents > 0 ? '#94a3b8' : '#6b7280',
            fontSize: '1rem'
          }}>
            {stats.totalStudents === 0 ? 'Sem Alunos' : 'Total de Alunos'}
          </div>
          {stats.totalStudents === 0 && (
            <div style={{
              color: '#6b7280',
              fontSize: '0.75rem',
              marginTop: '0.5rem',
              fontStyle: 'italic'
            }}>
              Adicione seu primeiro aluno
            </div>
          )}
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
            background: stats.totalWorkouts > 0 
              ? 'linear-gradient(135deg, #1e40af, #1e293b)'
              : 'linear-gradient(135deg, #6b7280, #4b5563)',
            marginBottom: '1rem'
          }}>
            <Dumbbell size={24} color="white" />
          </div>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: stats.totalWorkouts > 0 ? 'white' : '#9ca3af',
            marginBottom: '0.5rem'
          }}>
            {stats.totalWorkouts}
          </div>
          <div style={{
            color: stats.totalWorkouts > 0 ? '#94a3b8' : '#6b7280',
            fontSize: '1rem'
          }}>
            {stats.totalWorkouts === 0 ? 'Sem Treinos' : 'Total de Treinos'}
          </div>
          {stats.totalWorkouts === 0 && (
            <div style={{
              color: '#6b7280',
              fontSize: '0.75rem',
              marginTop: '0.5rem',
              fontStyle: 'italic'
            }}>
              Crie treinos para seus alunos
            </div>
          )}
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

        {/* Mensagem quando não há alunos */}
        {stats.totalStudents === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            color: '#94a3b8'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '4rem',
              height: '4rem',
              borderRadius: '1rem',
              background: 'rgba(59, 130, 246, 0.2)',
              marginBottom: '1rem'
            }}>
              <Users size={32} color="#94a3b8" />
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#e2e8f0',
              marginBottom: '0.5rem'
            }}>
              Nenhum aluno cadastrado
            </h3>
            <p style={{
              fontSize: '1rem',
              marginBottom: '1.5rem',
              maxWidth: '400px',
              margin: '0 auto 1.5rem'
            }}>
              {stats.message || "Você ainda não tem alunos cadastrados. Comece adicionando seu primeiro aluno!"}
            </p>
            <Link
              to="/dashboard/students/new"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '600',
                display: 'inline-flex',
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
              <Plus size={18} />
              Adicionar Primeiro Aluno
            </Link>
          </div>
        ) : (
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
                  fontFamily: 'monospace',
                  marginBottom: '0.5rem'
                }}>
                  Código: {student.accessCode}
                </div>
                {student.workoutCount && (
                  <div style={{
                    color: '#86efac',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    display: 'inline-block'
                  }}>
                    {student.workoutCount} treino{student.workoutCount > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
            <Route path="/students/new" element={<NewStudent />} />
            <Route path="/workouts" element={<WorkoutsList />} />
            <Route path="/workouts/new" element={<NewWorkout />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default PersonalDashboard;

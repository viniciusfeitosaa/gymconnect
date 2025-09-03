import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ArrowLeft, Dumbbell, Calendar, Target, Users, Trash2 } from 'lucide-react';
import './WorkoutsList.css';
import { getApiUrl } from '../utils/api';

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  weight?: string;
  rest: string;
  notes?: string;
}

interface Workout {
  id: string;
  name: string;
  description: string;
  studentName: string;
  studentAccessCode: string;
  created_at: string;
  exercises: Exercise[];
}

const WorkoutsList: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        // Usar a API real tanto em desenvolvimento quanto em produção
        const apiUrl = process.env.NODE_ENV === 'development' 
          ? getApiUrl('/workouts') 
          : '/.netlify/functions/api/workouts';
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setWorkouts(data.workouts || []);
        } else if (response.status === 401) {
          // Token inválido ou expirado
          console.error('Token inválido ou expirado');
          setWorkouts([]);
        } else {
          console.error('Erro ao carregar treinos:', response.status);
          setWorkouts([]);
        }
      } catch (error) {
        console.error('Erro ao carregar treinos:', error);
        setWorkouts([]);
      } finally {
        setLoading(false);
      }
    };



    fetchWorkouts();
  }, []);

  const handleDeleteWorkout = async (workoutId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este treino? Esta ação não pode ser desfeita.')) {
      try {
        // Usar a API real tanto em desenvolvimento quanto em produção
        const apiUrl = process.env.NODE_ENV === 'development' 
          ? getApiUrl('/workouts/${workoutId}') 
          : `/.netlify/functions/api/workouts/${workoutId}`;
        
        const response = await fetch(apiUrl, { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          // Remover treino da lista local
          setWorkouts(workouts.filter(workout => workout.id !== workoutId));
        } else {
          alert('Erro ao excluir treino');
        }
      } catch (error) {
        alert('Erro ao excluir treino');
      }
    }
  };

  const filteredWorkouts = workouts.filter(workout =>
    workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workout.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workout.studentAccessCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="workouts-loading" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(59, 130, 246, 0.3)',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div className="workouts-container">
      {/* Header */}
      <div className="workouts-header">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Link
            to="/dashboard"
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
            Voltar ao Dashboard
          </Link>
        </div>

        <Link
          to="/dashboard/workouts/new"
          className="workouts-create-btn"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
            color: 'white',
            borderRadius: '0.75rem',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600',
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
          Criar Novo Treino
        </Link>
      </div>

      {/* Título e estatísticas */}
      <div style={{
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div className="workouts-icon" style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
          marginBottom: '1rem'
        }}>
          <Dumbbell size={24} color="white" />
        </div>
        <h1 className="workouts-title" style={{
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '0.5rem'
        }}>
          Gerenciar Treinos
        </h1>
        <p className="workouts-subtitle" style={{
          color: '#94a3b8'
        }}>
          {workouts.length} treino{workouts.length !== 1 ? 's' : ''} criado{workouts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Barra de pesquisa */}
      <div className="workouts-search">
        <div style={{
          position: 'relative',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <div style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b'
          }}>
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome do treino, aluno ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="workouts-search-input"
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 3rem',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '0.75rem',
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
          />
        </div>
      </div>

      {/* Lista de treinos */}
      {filteredWorkouts.length === 0 ? (
        <div className="workouts-empty" style={{
          textAlign: 'center',
          backgroundColor: 'rgba(2, 6, 23, 0.6)',
          borderRadius: '1rem',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <Dumbbell size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#94a3b8',
            marginBottom: '0.5rem'
          }}>
            Nenhum treino encontrado
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: '0.875rem'
          }}>
            {searchTerm ? 'Tente ajustar os termos de busca.' : 'Comece criando seu primeiro treino.'}
          </p>
        </div>
      ) : (
        <div className="workouts-grid" style={{
          display: 'grid'
        }}>
          {filteredWorkouts.map((workout) => (
            <div
              key={workout.id}
              className="workout-card"
              style={{
                backgroundColor: 'rgba(2, 6, 23, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '1rem',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
              }}
            >
              {/* Header do card */}
              <div className="workout-card-header" style={{
                display: 'flex',
                marginBottom: '1rem'
              }}>
                <div>
                  <h3 className="workout-card-title" style={{
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '0.25rem'
                  }}>
                    {workout.name}
                  </h3>
                  <p style={{
                    color: '#64748b',
                    fontSize: '0.75rem'
                  }}>
                    Criado em {formatDate(workout.created_at)}
                  </p>
                </div>
              </div>

              {/* Descrição */}
              <p style={{
                color: '#94a3b8',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                lineHeight: '1.5'
              }}>
                {workout.description}
              </p>

              {/* Informações do aluno */}
              <div className="workout-student-info" style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <Users size={14} color="#94a3b8" />
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    Aluno: <strong style={{ color: 'white' }}>{workout.studentName}</strong>
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#94a3b8',
                  fontSize: '0.75rem'
                }}>
                  <Target size={14} />
                  Código: <strong style={{ color: 'white', fontFamily: 'monospace' }}>{workout.studentAccessCode}</strong>
                </div>
              </div>

              {/* Estatísticas do treino */}
              <div className="workout-stats" style={{
                display: 'flex',
                marginBottom: '1rem'
              }}>
                <div className="workout-stats-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: '#86efac'
                }}>
                  <Target size={12} />
                  {workout.exercises.length} exercício{workout.exercises.length > 1 ? 's' : ''}
                </div>
                <div className="workout-stats-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: '#94a3b8'
                }}>
                  <Calendar size={12} />
                  {formatDate(workout.created_at)}
                </div>
              </div>

              {/* Ações */}
              <div className="workout-card-actions" style={{
                display: 'flex'
              }}>
                <Link
                  to={`/dashboard/workouts/${workout.id}`}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    textAlign: 'center',
                    fontWeight: '500',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Ver Detalhes
                </Link>
                
                <Link
                  to={`/dashboard/workouts/${workout.id}/edit`}
                  style={{
                    flex: 1,
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    textAlign: 'center',
                    fontWeight: '500',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  }}
                >
                  Editar
                </Link>

                <button
                  onClick={() => handleDeleteWorkout(workout.id)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s',
                    minWidth: '44px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                  }}
                  title="Excluir treino"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default WorkoutsList;

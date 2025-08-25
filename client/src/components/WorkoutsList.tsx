import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, Clock, Dumbbell, User, Eye, Edit } from 'lucide-react';
import axios from 'axios';

interface Workout {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface Student {
  id: string;
  name: string;
  accessCode: string;
}

const WorkoutsList: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudentAndWorkouts = useCallback(async () => {
    try {
      // Buscar informações do aluno
      const studentResponse = await axios.get(`/api/students/${studentId}`);
      setStudent(studentResponse.data);

      // Buscar treinos do aluno
      const workoutsResponse = await axios.get(`/api/students/${studentId}/workouts`);
      setWorkouts(workoutsResponse.data);

      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar dados');
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchStudentAndWorkouts();
    }
  }, [studentId, fetchStudentAndWorkouts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
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

  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div style={{
          color: '#fca5a5',
          fontSize: '1.125rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
        <button
          onClick={fetchStudentAndWorkouts}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div style={{
          color: '#fca5a5',
          fontSize: '1.125rem'
        }}>
          Aluno não encontrado
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
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

        <Link
          to={`/dashboard/students/${studentId}/workouts/create`}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
            color: 'white',
            padding: '0.75rem 1.5rem',
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
          Criar Treino
        </Link>
      </div>

      {/* Informações do aluno */}
      <div style={{
        backgroundColor: 'rgba(2, 6, 23, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '1rem',
        padding: '2rem',
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
          Treinos de {student.name}
        </h1>
        <p style={{
          color: '#94a3b8',
          fontSize: '1rem',
          marginBottom: '1rem'
        }}>
          Código de acesso: <span style={{
            fontFamily: 'monospace',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            color: '#60a5fa'
          }}>{student.accessCode}</span>
        </p>
        <p style={{
          color: '#64748b',
          fontSize: '0.875rem'
        }}>
          {workouts.length} treino{workouts.length !== 1 ? 's' : ''} criado{workouts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Lista de treinos */}
      {workouts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
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
            Nenhum treino criado ainda
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: '0.875rem',
            marginBottom: '1.5rem'
          }}>
            Comece criando o primeiro treino para {student.name}
          </p>
          <Link
            to={`/dashboard/students/${studentId}/workouts/create`}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              display: 'inline-flex',
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
            Criar Primeiro Treino
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {workouts.map((workout) => (
            <div
              key={workout.id}
              style={{
                backgroundColor: 'rgba(2, 6, 23, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '1rem',
                padding: '1.5rem',
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
              {/* Header do treino */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.5rem',
                    background: 'linear-gradient(135deg, #1e40af, #1e293b)'
                  }}>
                    <Dumbbell size={16} color="white" />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: 'white',
                      marginBottom: '0.25rem'
                    }}>
                      {workout.name}
                    </h3>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      lineHeight: '1.4'
                    }}>
                      {workout.description || 'Sem descrição'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações de data */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#64748b',
                  fontSize: '0.75rem'
                }}>
                  <Calendar size={14} />
                  Criado em {formatDate(workout.created_at)}
                </div>
                {workout.updated_at !== workout.created_at && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#64748b',
                    fontSize: '0.75rem'
                  }}>
                    <Clock size={14} />
                    Atualizado em {formatTime(workout.updated_at)}
                  </div>
                )}
              </div>

              {/* Ações */}
              <div style={{
                display: 'flex',
                gap: '0.75rem'
              }}>
                <Link
                  to={`/dashboard/students/${studentId}/workouts/${workout.id}`}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                    color: 'white',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Eye size={16} />
                  Visualizar
                </Link>
                
                <Link
                  to={`/dashboard/students/${studentId}/workouts/${workout.id}/edit`}
                  style={{
                    flex: 1,
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: 'white',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
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
                  <Edit size={16} />
                  Editar
                </Link>
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

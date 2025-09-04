import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Dumbbell, Calendar, Target, Users, Clock, Weight, Repeat } from 'lucide-react';
import { getApiUrl } from '../utils/api';

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  weight: string;
  rest: string;
  notes: string;
}

interface Workout {
  id: number;
  name: string;
  description: string;
  studentName: string;
  studentAccessCode: string;
  created_at: string;
  exercises: Exercise[];
}

const WorkoutDetails: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token não encontrado');
          return;
        }

        const response = await fetch(getApiUrl('/workouts'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const foundWorkout = data.workouts.find((w: Workout) => w.id.toString() === workoutId);
          
          if (foundWorkout) {
            setWorkout(foundWorkout);
          } else {
            setError('Treino não encontrado');
          }
        } else if (response.status === 401) {
          setError('Token inválido ou expirado');
        } else {
          setError('Erro ao carregar treino');
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes do treino:', error);
        setError('Erro ao carregar treino');
      } finally {
        setLoading(false);
      }
    };

    if (workoutId) {
      fetchWorkoutDetails();
    }
  }, [workoutId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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

  if (error || !workout) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        color: '#fca5a5'
      }}>
        <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>
          {error || 'Treino não encontrado'}
        </h2>
        <Link
          to="/dashboard/workouts"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#3b82f6',
            textDecoration: 'none',
            fontSize: '0.875rem',
            transition: 'color 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#1e40af';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#3b82f6';
          }}
        >
          <ArrowLeft size={16} />
          Voltar aos Treinos
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem'
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
            to="/dashboard/workouts"
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
            Voltar aos Treinos
          </Link>
        </div>
      </div>

      {/* Informações do Treino */}
      <div style={{
        backgroundColor: 'rgba(2, 6, 23, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.5)',
        borderRadius: '1rem',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            {workout.name}
          </h1>
          {workout.description && (
            <p style={{
              color: '#94a3b8',
              fontSize: '1.125rem',
              lineHeight: '1.6'
            }}>
              {workout.description}
            </p>
          )}
        </div>

        {/* Informações do Aluno */}
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Users size={20} />
            Informações do Aluno
          </h3>
          <div style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Users size={16} color="#94a3b8" />
              <span style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                <strong>Aluno:</strong> {workout.studentName}
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Target size={16} color="#94a3b8" />
              <span style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                <strong>Código:</strong> <span style={{ fontFamily: 'monospace' }}>{workout.studentAccessCode}</span>
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Calendar size={16} color="#94a3b8" />
              <span style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                <strong>Criado em:</strong> {formatDate(workout.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Estatísticas do Treino */}
        <div style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '0.5rem',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <Dumbbell size={24} color="#10b981" style={{ marginBottom: '0.5rem' }} />
            <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {workout.exercises.length}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              Exercício{workout.exercises.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '0.5rem',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <Repeat size={24} color="#3b82f6" style={{ marginBottom: '0.5rem' }} />
            <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {workout.exercises.reduce((total, ex) => total + ex.sets, 0)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              Séries Total
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '0.5rem',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <Target size={24} color="#a855f7" style={{ marginBottom: '0.5rem' }} />
            <div style={{ color: '#a855f7', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {workout.exercises.reduce((total, ex) => total + (ex.sets * ex.reps), 0)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              Repetições Total
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Exercícios */}
      <div style={{
        backgroundColor: 'rgba(2, 6, 23, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.5)',
        borderRadius: '1rem',
        padding: '2rem'
      }}>
        <h2 style={{
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Dumbbell size={24} />
          Exercícios ({workout.exercises.length})
        </h2>

        {workout.exercises.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#94a3b8'
          }}>
            <Dumbbell size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
            <p>Nenhum exercício encontrado neste treino.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '1.5rem'
          }}>
            {workout.exercises.map((exercise, index) => (
              <div
                key={exercise.id}
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    margin: 0
                  }}>
                    {index + 1}. {exercise.name}
                  </h3>
                </div>

                <div style={{
                  display: 'grid',
                  gap: '1rem',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Repeat size={16} color="#3b82f6" />
                    <span style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                      <strong>{exercise.sets}</strong> séries
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Target size={16} color="#10b981" />
                    <span style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                      <strong>{exercise.reps}</strong> reps
                    </span>
                  </div>

                  {exercise.weight && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Weight size={16} color="#f59e0b" />
                      <span style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                        <strong>{exercise.weight}</strong>
                      </span>
                    </div>
                  )}

                  {exercise.rest && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Clock size={16} color="#ef4444" />
                      <span style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                        <strong>{exercise.rest}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {exercise.notes && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(2, 6, 23, 0.6)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '0.5rem'
                  }}>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      margin: 0,
                      fontStyle: 'italic'
                    }}>
                      <strong>Observações:</strong> {exercise.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default WorkoutDetails;

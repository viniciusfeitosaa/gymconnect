import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Dumbbell, Calendar, Target, Users, Trash2, Search } from 'lucide-react';
import './WorkoutsList.css';
import { getApiUrl } from '../utils/api';
import SuccessModal from './SuccessModal';

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

interface Student {
  id: string;
  name: string;
  access_code: string;
}

const StudentSpecificWorkouts: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar dados do aluno
        const studentsResponse = await fetch(getApiUrl('/students'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          const foundStudent = studentsData.students.find((s: Student) => s.id === studentId);
          setStudent(foundStudent || null);
        }

        // Buscar todos os treinos (como não há vinculação direta, mostramos todos)
        const workoutsResponse = await fetch(getApiUrl('/workouts'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (workoutsResponse.ok) {
          const workoutsData = await workoutsResponse.json();
          setWorkouts(workoutsData.workouts || []);
        } else if (workoutsResponse.status === 401) {
          console.error('Token inválido ou expirado');
          setWorkouts([]);
        } else {
          console.error('Erro ao carregar treinos:', workoutsResponse.status);
          setWorkouts([]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setWorkouts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const handleDeleteWorkout = (workout: Workout) => {
    setWorkoutToDelete(workout);
    setShowDeleteModal(true);
  };

  const confirmDeleteWorkout = async () => {
    if (!workoutToDelete) return;

    try {
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? getApiUrl(`/workouts/${workoutToDelete.id}`) 
        : `/.netlify/functions/api/workouts/${workoutToDelete.id}`;
      
      const response = await fetch(apiUrl, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setWorkouts(workouts.filter(workout => workout.id !== workoutToDelete.id));
        setSuccessMessage('Treino excluído com sucesso!');
        setModalType('success');
        setShowSuccessModal(true);
      } else {
        setSuccessMessage('Erro ao excluir treino');
        setModalType('error');
        setShowSuccessModal(true);
      }
    } catch (error) {
      setSuccessMessage('Erro ao excluir treino');
      setModalType('error');
      setShowSuccessModal(true);
    } finally {
      setShowDeleteModal(false);
      setWorkoutToDelete(null);
    }
  };

  const filteredWorkouts = workouts.filter(workout =>
    workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workout.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="workouts-loading" style={{
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

  if (!student) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        color: '#fca5a5'
      }}>
        Aluno não encontrado
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
          className="workouts-create-btn"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
            color: 'white',
            borderRadius: '0.75rem',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            fontWeight: '600',
            transition: 'all 0.3s',
            fontSize: '0.875rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Plus size={18} />
          Criar Treino
        </Link>
      </div>

      {/* Título */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
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
          fontSize: '1rem'
        }}>
          Código de acesso: {student.access_code}
        </p>
      </div>

      {/* Barra de pesquisa */}
      <div style={{
        marginBottom: '2rem',
        position: 'relative'
      }}>
        <input
          type="text"
          placeholder="Buscar treinos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 2.5rem',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '0.75rem',
            color: 'white',
            fontSize: '0.875rem',
            transition: 'all 0.3s'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
            e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
            e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
          }}
        />
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8'
          }}
        />
      </div>

      {/* Lista de treinos */}
      {filteredWorkouts.length === 0 ? (
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
            <Dumbbell size={32} color="#94a3b8" />
          </div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#e2e8f0',
            marginBottom: '0.5rem'
          }}>
            {searchTerm ? 'Nenhum treino encontrado' : 'Nenhum treino criado'}
          </h3>
          <p style={{
            fontSize: '1rem',
            margin: '0 auto 1.5rem',
            maxWidth: '400px'
          }}>
            {searchTerm 
              ? 'Tente ajustar os termos de busca.'
              : 'Comece criando o primeiro treino para este aluno!'
            }
          </p>
          {!searchTerm && (
            <Link
              to={`/dashboard/students/${studentId}/workouts/create`}
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
              Criar Primeiro Treino
            </Link>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
        }}>
          {filteredWorkouts.map((workout) => (
            <div
              key={workout.id}
              className="workout-card"
              style={{
                backgroundColor: 'rgba(2, 6, 23, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '1rem',
                transition: '0.3s',
                transform: 'translateY(-5px)'
              }}
            >
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
                    color: 'rgb(100, 116, 139)',
                    fontSize: '0.75rem'
                  }}>
                    Criado em {formatDate(workout.created_at)}
                  </p>
                </div>
              </div>

              <p style={{
                color: 'rgb(148, 163, 184)',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                lineHeight: '1.5'
              }}>
                {workout.description}
              </p>

              <div className="workout-stats" style={{
                display: 'flex',
                marginBottom: '1rem'
              }}>
                <div className="workout-stats-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: 'rgb(134, 239, 172)'
                }}>
                  <Target size={12} />
                  {workout.exercises.length} exercício{workout.exercises.length !== 1 ? 's' : ''}
                </div>
                <div className="workout-stats-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: 'rgb(148, 163, 184)'
                }}>
                  <Calendar size={12} />
                  {formatDate(workout.created_at)}
                </div>
              </div>

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
                    transition: '0.3s'
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
                    transition: '0.3s'
                  }}
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDeleteWorkout(workout)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: '0.3s',
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

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'rgba(2, 6, 23, 0.95)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{
              color: '#ef4444',
              marginBottom: '1rem'
            }}>
              <Trash2 size={48} />
            </div>
            <h3 style={{
              color: 'white',
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              Confirmar Exclusão
            </h3>
            <p style={{
              color: '#94a3b8',
              marginBottom: '2rem',
              lineHeight: '1.5'
            }}>
              Tem certeza que deseja excluir o treino <strong style={{ color: 'white' }}>"{workoutToDelete?.name}"</strong>?<br />
              Esta ação não pode ser desfeita.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setWorkoutToDelete(null);
                }}
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#93c5fd',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteWorkout}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
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
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Sucesso/Erro */}
      <SuccessModal
        isOpen={showSuccessModal}
        title={modalType === 'success' ? 'Sucesso!' : 'Erro'}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
        type={modalType}
      />
    </div>
  );
};

export default StudentSpecificWorkouts;

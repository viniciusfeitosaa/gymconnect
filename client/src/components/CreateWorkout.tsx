import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  rest?: string;
  notes?: string;
}

interface Student {
  id: string;
  name: string;
  access_code: string;
}

const CreateWorkout: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: '', sets: 3, reps: '10-12', weight: '', rest: '60s', notes: '' }
  ]);

  const fetchStudent = useCallback(async () => {
    try {
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/students' 
        : '/.netlify/functions/api/students';
        
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao carregar dados do aluno');
      }

      const data = await response.json();
      const currentStudent = data.find((s: any) => s.id === studentId);
      
      if (!currentStudent) {
        setError('Aluno não encontrado');
        return;
      }
      
      setStudent(currentStudent);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do aluno');
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchStudent();
    }
  }, [studentId, fetchStudent]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'workoutName') {
      setWorkoutName(value);
    } else if (name === 'workoutDescription') {
      setWorkoutDescription(value);
    }
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string | number) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: '10-12', weight: '', rest: '60s', notes: '' }]);
  };

  const removeExercise = (index: number) => {
    if (exercises.length > 1) {
      const newExercises = exercises.filter((_, i) => i !== index);
      setExercises(newExercises);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workoutName.trim()) {
      setError('Nome do treino é obrigatório');
      return;
    }

    if (exercises.some(ex => !ex.name.trim())) {
      setError('Todos os exercícios devem ter um nome');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const workoutData = {
        name: workoutName,
        description: workoutDescription,
        exercises: exercises
      };

      const apiUrl = process.env.NODE_ENV === 'development' 
        ? `http://localhost:5000/api/students/${studentId}/workouts` 
        : `/.netlify/functions/api/students/${studentId}/workouts`;
        
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(workoutData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar treino');
      }

      navigate(`/dashboard/students/${studentId}/workouts`);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar treino');
    } finally {
      setLoading(false);
    }
  };

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
          {error || 'Carregando...'}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
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
            to={`/dashboard/students/${studentId}/workouts`}
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
          Criar Novo Treino
        </h1>
        <p style={{
          color: '#94a3b8',
          fontSize: '1rem'
        }}>
          Para {student.name} ({student.access_code})
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit}>
        <div style={{
          backgroundColor: 'rgba(2, 6, 23, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Informações básicas do treino */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '1rem'
            }}>
              Informações do Treino
            </h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                color: '#f1f5f9',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                Nome do Treino *
              </label>
              <input
                type="text"
                name="workoutName"
                value={workoutName}
                onChange={handleFormChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '0.5rem',
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
                placeholder="Ex: Treino A - Superior"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#f1f5f9',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                Descrição (opcional)
              </label>
              <textarea
                name="workoutDescription"
                value={workoutDescription}
                onChange={handleFormChange}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '1rem',
                  resize: 'vertical',
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
                placeholder="Descreva o objetivo ou foco do treino..."
              />
            </div>
          </div>

          {/* Lista de exercícios */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'white'
              }}>
                Exercícios
              </h2>
              <button
                type="button"
                onClick={addExercise}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
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
                <Plus size={16} />
                Adicionar Exercício
              </button>
            </div>

            {exercises.map((exercise, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  marginBottom: '1rem'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    Exercício {index + 1}
                  </h3>
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#fca5a5',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontSize: '0.75rem',
                      marginBottom: '0.25rem'
                    }}>
                      Nome do Exercício *
                    </label>
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(2, 6, 23, 0.8)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '0.375rem',
                        color: 'white',
                        fontSize: '0.875rem',
                        transition: 'all 0.3s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                      }}
                      placeholder="Ex: Supino Reto"
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontSize: '0.75rem',
                      marginBottom: '0.25rem'
                    }}>
                      Séries
                    </label>
                    <input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))}
                      min="1"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(2, 6, 23, 0.8)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '0.375rem',
                        color: 'white',
                        fontSize: '0.875rem',
                        transition: 'all 0.3s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontSize: '0.75rem',
                      marginBottom: '0.25rem'
                    }}>
                      Repetições
                    </label>
                    <input
                      type="text"
                      value={exercise.reps}
                      onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(2, 6, 23, 0.8)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '0.375rem',
                        color: 'white',
                        fontSize: '0.875rem',
                        transition: 'all 0.3s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                      }}
                      placeholder="Ex: 10-12"
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontSize: '0.75rem',
                      marginBottom: '0.25rem'
                    }}>
                      Peso (opcional)
                    </label>
                    <input
                      type="text"
                      value={exercise.weight}
                      onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(2, 6, 23, 0.8)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '0.375rem',
                        color: 'white',
                        fontSize: '0.875rem',
                        transition: 'all 0.3s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                      }}
                      placeholder="Ex: 20kg"
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      color: '#e2e8f0',
                      fontSize: '0.75rem',
                      marginBottom: '0.25rem'
                    }}>
                      Descanso
                    </label>
                    <input
                      type="text"
                      value={exercise.rest}
                      onChange={(e) => handleExerciseChange(index, 'rest', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(2, 6, 23, 0.8)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '0.375rem',
                        color: 'white',
                        fontSize: '0.875rem',
                        transition: 'all 0.3s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                      }}
                      placeholder="Ex: 60s"
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '0.75rem',
                    marginBottom: '0.25rem'
                  }}>
                    Observações (opcional)
                  </label>
                  <textarea
                    value={exercise.notes}
                    onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '0.375rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      resize: 'vertical',
                      transition: 'all 0.3s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                    }}
                    placeholder="Observações sobre a execução..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mensagem de erro */}
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

        {/* Botões de ação */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <Link
            to={`/dashboard/students/${studentId}/workouts`}
            style={{
              border: '2px solid rgba(59, 130, 246, 0.3)',
              color: 'white',
              padding: '0.875rem 2rem',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              fontWeight: '600',
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
            Cancelar
          </Link>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
              color: 'white',
              border: 'none',
              padding: '0.875rem 2rem',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <Save size={20} />
            {loading ? 'Salvando...' : 'Salvar Treino'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateWorkout;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Dumbbell, Save, X, Plus, Trash2 } from 'lucide-react';

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  weight: string;
  rest: string;
  notes: string;
}

interface NewWorkoutForm {
  name: string;
  description: string;
  studentId: string;
  exercises: Exercise[];
}

interface FormErrors {
  name?: string;
  description?: string;
  studentId?: string;
  exercises?: string;
}

interface ExerciseErrors {
  name?: string;
  sets?: string;
  reps?: string;
  weight?: string;
  rest?: string;
  notes?: string;
}

interface Student {
  id: string;
  name: string;
  accessCode: string;
}

const NewWorkout: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<NewWorkoutForm>({
    name: '',
    description: '',
    studentId: '',
    exercises: []
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [exerciseErrors, setExerciseErrors] = useState<{[key: number]: ExerciseErrors}>({});

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        const response = await fetch('/api/students');
        if (response.ok) {
          const data = await response.json();
          setStudents(data.students);
        }
      }
    } catch (error) {
      // Erro ao carregar alunos
    }
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now(),
      name: '',
      sets: 3,
      reps: 10,
      weight: '',
      rest: '60 seg',
      notes: ''
    };
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
  };

  const removeExercise = (exerciseId: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== exerciseId)
    }));
    // Limpar erros do exercício removido
    setExerciseErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[exerciseId];
      return newErrors;
    });
  };

  const updateExercise = (exerciseId: number, field: keyof Exercise, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === exerciseId ? { ...ex, [field]: value } : ex
      )
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (exerciseErrors[exerciseId] && field in exerciseErrors[exerciseId]) {
      setExerciseErrors(prev => ({
        ...prev,
        [exerciseId]: {
          ...prev[exerciseId],
          [field]: undefined
        }
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const newExerciseErrors: {[key: number]: ExerciseErrors} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do treino é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.studentId) {
      newErrors.studentId = 'Selecione um aluno';
    }

    if (formData.exercises.length === 0) {
      newErrors.exercises = 'Adicione pelo menos um exercício';
    }

    // Validar cada exercício
    formData.exercises.forEach((exercise, index) => {
      const exerciseError: ExerciseErrors = {};
      
      if (!exercise.name.trim()) {
        exerciseError.name = 'Nome do exercício é obrigatório';
      }
      
      if (exercise.sets < 1) {
        exerciseError.sets = 'Número de séries deve ser maior que 0';
      }
      
      if (exercise.reps < 1) {
        exerciseError.reps = 'Número de repetições deve ser maior que 0';
      }

      if (Object.keys(exerciseError).length > 0) {
        newExerciseErrors[exercise.id] = exerciseError;
      }
    });

    setErrors(newErrors);
    setExerciseErrors(newExerciseErrors);

    return Object.keys(newErrors).length === 0 && Object.keys(newExerciseErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (process.env.NODE_ENV === 'development') {
        const response = await fetch('/api/workouts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            created_at: new Date().toISOString()
          }),
        });

        if (response.ok) {
          alert('Treino criado com sucesso!');
          navigate('/dashboard/workouts');
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Erro ao criar treino');
        }
      } else {
        alert('Treino criado com sucesso!');
        navigate('/dashboard/workouts');
      }
    } catch (error) {
      alert('Erro ao criar treino');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof NewWorkoutForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '900px',
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

      {/* Título */}
      <div style={{
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
          <Dumbbell size={24} color="white" />
        </div>
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
          Configure o treino para seu aluno
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'rgba(2, 6, 23, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '1rem',
        padding: '2rem'
      }}>
        {/* Nome do Treino */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Nome do Treino *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            autoComplete="off"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: `1px solid ${errors.name ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)'}`,
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '1rem',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = errors.name ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.6)';
              e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.name ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)';
              e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
            }}
            placeholder="Ex: Treino A - Força Superior"
          />
          {errors.name && (
            <div style={{
              color: '#fca5a5',
              fontSize: '0.75rem',
              marginTop: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <X size={12} />
              {errors.name}
            </div>
          )}
        </div>

        {/* Descrição */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Descrição *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: `1px solid ${errors.description ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)'}`,
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '1rem',
              resize: 'vertical',
              transition: 'all 0.3s',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = errors.description ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.6)';
              e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.description ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)';
              e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
            }}
            placeholder="Descreva o objetivo e foco do treino"
          />
          {errors.description && (
            <div style={{
              color: '#fca5a5',
              fontSize: '0.75rem',
              marginTop: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <X size={12} />
              {errors.description}
            </div>
          )}
        </div>

        {/* Seleção de Aluno */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Aluno *
          </label>
          <select
            value={formData.studentId}
            onChange={(e) => handleInputChange('studentId', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: `1px solid ${errors.studentId ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)'}`,
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '1rem',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = errors.studentId ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.6)';
              e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.studentId ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)';
              e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
            }}
          >
            <option value="">Selecione um aluno</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.accessCode})
              </option>
            ))}
          </select>
          {errors.studentId && (
            <div style={{
              color: '#fca5a5',
              fontSize: '0.75rem',
              marginTop: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <X size={12} />
              {errors.studentId}
            </div>
          )}
        </div>

        {/* Seção de Exercícios */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'white'
            }}>
              Exercícios
            </h3>
            <button
              type="button"
              onClick={addExercise}
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#4ade80',
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
                e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)';
              }}
            >
              <Plus size={16} />
              Adicionar Exercício
            </button>
          </div>

          {errors.exercises && (
            <div style={{
              color: '#fca5a5',
              fontSize: '0.75rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <X size={12} />
              <span>{errors.exercises}</span>
            </div>
          )}

          {formData.exercises.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '0.5rem',
              color: '#64748b'
            }}>
              <Dumbbell size={32} style={{ marginBottom: '0.5rem' }} />
              <p>Nenhum exercício adicionado</p>
              <p style={{ fontSize: '0.75rem' }}>Clique em "Adicionar Exercício" para começar</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {formData.exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    position: 'relative'
                  }}
                >
                  {/* Header do exercício */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <h4 style={{
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      Exercício {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeExercise(exercise.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#fca5a5',
                        padding: '0.25rem',
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
                  </div>

                  {/* Campos do exercício */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem'
                  }}>
                    {/* Nome do exercício */}
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        marginBottom: '0.25rem'
                      }}>
                        Nome *
                      </label>
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'rgba(2, 6, 23, 0.8)',
                          border: `1px solid ${exerciseErrors[exercise.id]?.name ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.2)'}`,
                          borderRadius: '0.375rem',
                          color: 'white',
                          fontSize: '0.875rem'
                        }}
                        placeholder="Nome do exercício"
                      />
                      {exerciseErrors[exercise.id]?.name && (
                        <div style={{
                          color: '#fca5a5',
                          fontSize: '0.625rem',
                          marginTop: '0.25rem'
                        }}>
                          {exerciseErrors[exercise.id].name}
                        </div>
                      )}
                    </div>

                    {/* Peso */}
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        marginBottom: '0.25rem'
                      }}>
                        Peso
                      </label>
                      <input
                        type="text"
                        value={exercise.weight}
                        onChange={(e) => updateExercise(exercise.id, 'weight', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'rgba(2, 6, 23, 0.8)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          borderRadius: '0.375rem',
                          color: 'white',
                          fontSize: '0.875rem'
                        }}
                        placeholder="Ex: 60kg"
                      />
                    </div>

                    {/* Séries */}
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        marginBottom: '0.25rem'
                      }}>
                        Séries *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'rgba(2, 6, 23, 0.8)',
                          border: `1px solid ${exerciseErrors[exercise.id]?.sets ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.2)'}`,
                          borderRadius: '0.375rem',
                          color: 'white',
                          fontSize: '0.875rem'
                        }}
                      />
                      {exerciseErrors[exercise.id]?.sets && (
                        <div style={{
                          color: '#fca5a5',
                          fontSize: '0.625rem',
                          marginTop: '0.25rem'
                        }}>
                          {exerciseErrors[exercise.id].sets}
                        </div>
                      )}
                    </div>

                    {/* Repetições */}
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        marginBottom: '0.25rem'
                      }}>
                        Repetições *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(exercise.id, 'reps', parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'rgba(2, 6, 23, 0.8)',
                          border: `1px solid ${exerciseErrors[exercise.id]?.reps ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.2)'}`,
                          borderRadius: '0.375rem',
                          color: 'white',
                          fontSize: '0.875rem'
                        }}
                      />
                      {exerciseErrors[exercise.id]?.reps && (
                        <div style={{
                          color: '#fca5a5',
                          fontSize: '0.625rem',
                          marginTop: '0.25rem'
                        }}>
                          {exerciseErrors[exercise.id].reps}
                        </div>
                      )}
                    </div>

                    {/* Descanso */}
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        marginBottom: '0.25rem'
                      }}>
                        Descanso
                      </label>
                      <input
                        type="text"
                        value={exercise.rest}
                        onChange={(e) => updateExercise(exercise.id, 'rest', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: 'rgba(2, 6, 23, 0.8)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          borderRadius: '0.375rem',
                          color: 'white',
                          fontSize: '0.875rem'
                        }}
                        placeholder="Ex: 2 min"
                      />
                    </div>

                    {/* Observações */}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{
                        display: 'block',
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        marginBottom: '0.25rem'
                      }}>
                        Observações
                      </label>
                      <textarea
                        value={exercise.notes}
                        onChange={(e) => updateExercise(exercise.id, 'notes', e.target.value)}
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
                          fontFamily: 'inherit'
                        }}
                        placeholder="Dicas de execução, técnica, etc."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botões */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <Link
            to="/dashboard/workouts"
            style={{
              border: '1px solid rgba(148, 163, 184, 0.3)',
              color: '#94a3b8',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
            }}
          >
            Cancelar
          </Link>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading 
                ? 'rgba(59, 130, 246, 0.3)' 
                : 'linear-gradient(135deg, #3b82f6, #1e40af)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} />
                Salvar Treino
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default NewWorkout;

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import './NewWorkout.css';
import { getApiUrl } from '../utils/api';
import SuccessModal from './SuccessModal';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: string;
  rest: string;
  notes: string;
}

interface Student {
  id: string;
  name: string;
  access_code: string;
}

interface ExerciseErrors {
  name?: string;
  sets?: string;
  reps?: string;
}

const StudentSpecificNewWorkout: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingExercise, setSavingExercise] = useState<string | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [savedExercises, setSavedExercises] = useState<Exercise[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [exerciseErrors, setExerciseErrors] = useState<{ [key: string]: ExerciseErrors }>({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    exercises: [] as Exercise[]
  });

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(getApiUrl('/students'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const foundStudent = data.students.find((s: Student) => s.id === studentId);
          setStudent(foundStudent || null);
        }
      } catch (error) {
        console.error('Erro ao buscar aluno:', error);
      }
    };

    fetchStudent();
  }, [studentId]);

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: 1,
      reps: 1,
      weight: '',
      rest: '',
      notes: ''
    };

    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
  };

  const removeExercise = (exerciseId: string) => {
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

    // Limpar o exercício sendo editado se for o mesmo
    if (editingExercise && editingExercise.id === exerciseId) {
      setEditingExercise(null);
    }
  };

  const updateExercise = (exerciseId: string, field: keyof Exercise, value: string | number) => {
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

  const saveExercise = async (exercise: Exercise) => {
    // Validar o exercício antes de salvar
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
      setExerciseErrors(prev => ({
        ...prev,
        [exercise.id]: exerciseError
      }));
      return;
    }

    setSavingExercise(exercise.id);

    try {
      // Em vez de salvar no backend, apenas mover para a lista de exercícios salvos
      // Isso evita criar treinos automáticos
      const savedExercise = {
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        rest: exercise.rest,
        notes: exercise.notes
      };
      
      // Adicionar o exercício à lista de exercícios salvos
      setSavedExercises(prev => [...prev, savedExercise]);
      
      // Remover o exercício da lista local após salvar
      setFormData(prev => ({
        ...prev,
        exercises: prev.exercises.filter(ex => ex.id !== exercise.id)
      }));

      // Limpar o estado de edição se este era o exercício sendo editado
      if (editingExercise && editingExercise.id === exercise.id) {
        setEditingExercise(null);
      }

      // Limpar erros do exercício salvo
      setExerciseErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[exercise.id];
        return newErrors;
      });

      // Mostrar modal de sucesso
      setSuccessMessage('Exercício adicionado ao treino!');
      setModalType('success');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao processar exercício:', error);
      setSuccessMessage('Erro ao processar exercício. Tente novamente.');
      setModalType('error');
      setShowSuccessModal(true);
    } finally {
      setSavingExercise(null);
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    // Mover o exercício da lista de salvos para a lista de edição
    setSavedExercises(prev => prev.filter(ex => ex.id !== exercise.id));
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, exercise]
    }));
    setEditingExercise(exercise);
  };

  const removeSavedExercise = (exerciseId: string) => {
    setSavedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setSuccessMessage('Nome do treino é obrigatório');
      setModalType('error');
      setShowSuccessModal(true);
      return false;
    }

    if (formData.exercises.length === 0 && savedExercises.length === 0) {
      setSuccessMessage('Adicione pelo menos um exercício');
      setModalType('error');
      setShowSuccessModal(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (process.env.NODE_ENV === 'development') {
        const allExercises = [...formData.exercises, ...savedExercises];

        const requestBody = {
          studentId: studentId,
          name: formData.name,
          description: formData.description,
          exercises: allExercises,
          created_at: new Date().toISOString()
        };

        const token = localStorage.getItem('token');

        if (!token) {
          setSuccessMessage('Você precisa estar logado para criar um treino');
          setModalType('error');
          setShowSuccessModal(true);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        const response = await fetch(getApiUrl('/workouts'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const result = await response.json();
          setSuccessMessage('Treino criado com sucesso!');
          setModalType('success');
          setShowSuccessModal(true);
          setTimeout(() => {
            navigate(`/dashboard/students/${studentId}/workouts`);
          }, 2000);
        } else if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          setSuccessMessage('Sua sessão expirou. Faça login novamente.');
          setModalType('error');
          setShowSuccessModal(true);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          const errorData = await response.json();
          setSuccessMessage(errorData.error || 'Erro ao criar treino');
          setModalType('error');
          setShowSuccessModal(true);
        }
      } else {
        setSuccessMessage('Treino criado com sucesso!');
        setModalType('success');
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate(`/dashboard/students/${studentId}/workouts`);
        }, 2000);
      }
    } catch (error) {
      setSuccessMessage('Erro ao criar treino');
      setModalType('error');
      setShowSuccessModal(true);
    } finally {
      setLoading(false);
    }
  };

  if (!student) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        color: '#fca5a5'
      }}>
        Carregando dados do aluno...
      </div>
    );
  }

  return (
    <div className="new-workout-container">
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
      <form onSubmit={handleSubmit} className="new-workout-form">
        {/* Informações do Treino */}
        <div className="new-workout-section">
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1rem'
          }}>
            Informações do Treino
          </h2>
          
          <div style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: '1fr'
          }}>
            <div>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                Nome do Treino *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Treino de Peito e Tríceps"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '0.5rem',
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
            </div>
            
            <div>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o objetivo do treino..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  resize: 'vertical',
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
            </div>
          </div>
        </div>

        {/* Exercícios */}
        <div className="new-workout-section">
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
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
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
              <Plus size={16} />
              Adicionar Exercício
            </button>
          </div>

          {/* Lista de exercícios em edição */}
          {formData.exercises.map((exercise) => (
            <div
              key={exercise.id}
              className={`new-workout-exercise-card ${editingExercise && editingExercise.id === exercise.id ? 'editing' : ''}`}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '1rem',
                transition: 'all 0.3s'
              }}
            >
              <div className="new-workout-exercise-header" style={{
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
                  {editingExercise && editingExercise.id === exercise.id ? '✏️ Editando:' : ''} Exercício {formData.exercises.indexOf(exercise) + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeExercise(exercise.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    marginBottom: '0.25rem'
                  }}>
                    Nome do Exercício *
                  </label>
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                    placeholder="Ex: Supino Reto"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(2, 6, 23, 0.6)',
                      border: exerciseErrors[exercise.id]?.name ? '1px solid #ef4444' : '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '0.375rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      transition: 'all 0.3s'
                    }}
                  />
                  {exerciseErrors[exercise.id]?.name && (
                    <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {exerciseErrors[exercise.id].name}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    marginBottom: '0.25rem'
                  }}>
                    Séries *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={exercise.sets}
                    onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value) || 1)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(2, 6, 23, 0.6)',
                      border: exerciseErrors[exercise.id]?.sets ? '1px solid #ef4444' : '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '0.375rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      transition: 'all 0.3s'
                    }}
                  />
                  {exerciseErrors[exercise.id]?.sets && (
                    <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {exerciseErrors[exercise.id].sets}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    marginBottom: '0.25rem'
                  }}>
                    Repetições *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={exercise.reps}
                    onChange={(e) => updateExercise(exercise.id, 'reps', parseInt(e.target.value) || 1)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(2, 6, 23, 0.6)',
                      border: exerciseErrors[exercise.id]?.reps ? '1px solid #ef4444' : '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '0.375rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      transition: 'all 0.3s'
                    }}
                  />
                  {exerciseErrors[exercise.id]?.reps && (
                    <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {exerciseErrors[exercise.id].reps}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    marginBottom: '0.25rem'
                  }}>
                    Peso
                  </label>
                  <input
                    type="text"
                    value={exercise.weight}
                    onChange={(e) => updateExercise(exercise.id, 'weight', e.target.value)}
                    placeholder="Ex: 80kg"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(2, 6, 23, 0.6)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '0.375rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      transition: 'all 0.3s'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    marginBottom: '0.25rem'
                  }}>
                    Descanso
                  </label>
                  <input
                    type="text"
                    value={exercise.rest}
                    onChange={(e) => updateExercise(exercise.id, 'rest', e.target.value)}
                    placeholder="Ex: 90s"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(2, 6, 23, 0.6)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '0.375rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      transition: 'all 0.3s'
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    marginBottom: '0.25rem'
                  }}>
                    Observações
                  </label>
                  <textarea
                    value={exercise.notes}
                    onChange={(e) => updateExercise(exercise.id, 'notes', e.target.value)}
                    placeholder="Observações sobre o exercício..."
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(2, 6, 23, 0.6)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '0.375rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      resize: 'vertical',
                      transition: 'all 0.3s'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '1rem'
              }}>
                <button
                  type="button"
                  onClick={() => saveExercise(exercise)}
                  disabled={savingExercise === exercise.id}
                  className="new-workout-save-exercise-btn"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.3s',
                    fontSize: '0.875rem',
                    opacity: savingExercise === exercise.id ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (savingExercise !== exercise.id) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Save size={14} />
                  {savingExercise === exercise.id ? 'Salvando...' : 'Salvar Exercício'}
                </button>
              </div>
            </div>
          ))}

          {/* Lista de exercícios salvos */}
          {savedExercises.length > 0 && (
            <div className="new-workout-exercises-list" style={{
              marginTop: '2rem'
            }}>
              <h3 style={{
                color: 'white',
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '1rem'
              }}>
                Exercícios Adicionados ({savedExercises.length})
              </h3>
              
              {savedExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="new-workout-exercise-item saved"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    transition: 'all 0.3s',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="new-workout-exercise-header" style={{
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
                      {exercise.name}
                    </h4>
                  </div>

                  <div className="new-workout-exercise-details">
                    <div className="new-workout-exercise-info" style={{
                      display: 'grid',
                      gap: '0.5rem',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      marginBottom: '1rem'
                    }}>
                      <span style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                        <strong>Séries:</strong> {exercise.sets}
                      </span>
                      <span style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                        <strong>Repetições:</strong> {exercise.reps}
                      </span>
                      {exercise.weight && (
                        <span style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                          <strong>Peso:</strong> {exercise.weight}
                        </span>
                      )}
                      {exercise.rest && (
                        <span style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                          <strong>Descanso:</strong> {exercise.rest}
                        </span>
                      )}
                    </div>

                    {exercise.notes && (
                      <div style={{
                        backgroundColor: 'rgba(2, 6, 23, 0.6)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        marginBottom: '1rem'
                      }}>
                        <p style={{
                          color: '#94a3b8',
                          fontSize: '0.875rem',
                          margin: 0,
                          fontStyle: 'italic'
                        }}>
                          {exercise.notes}
                        </p>
                      </div>
                    )}

                    <div className="new-workout-exercise-actions" style={{
                      display: 'flex',
                      gap: '0.5rem',
                      justifyContent: 'flex-end'
                    }}>
                      <button
                        type="button"
                        onClick={() => handleEditExercise(exercise)}
                        className="new-workout-exercise-action-btn edit"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          padding: '0.5rem 1rem',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '0.875rem',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSavedExercise(exercise.id)}
                        className="new-workout-exercise-action-btn delete"
                        style={{
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          padding: '0.5rem 1rem',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '0.875rem',
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
              ))}
            </div>
          )}
        </div>

        {/* Botão de Salvar Treino */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '2rem'
        }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '1rem 2rem',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Save size={20} />
            {loading ? 'Criando Treino...' : 'Criar Treino'}
          </button>
        </div>
      </form>

      {/* Modal de Sucesso/Erro */}
      <SuccessModal
        isOpen={showSuccessModal}
        title={modalType === 'success' ? 'Sucesso!' : 'Atenção'}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
        type={modalType}
      />
    </div>
  );
};

export default StudentSpecificNewWorkout;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Dumbbell, Save, X, Plus, Trash2 } from 'lucide-react';
import SuccessModal from './SuccessModal';
import './NewWorkout.css';
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
  access_code: string;
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
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loading, setLoading] = useState(false);
  const [savingExercise, setSavingExercise] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [errors, setErrors] = useState<FormErrors>({});
  const [exerciseErrors, setExerciseErrors] = useState<{[key: number]: ExerciseErrors}>({});
  const [savedExercises, setSavedExercises] = useState<Exercise[]>([]);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Token não encontrado');
        setStudents([]);
        return;
      }

      console.log('Buscando alunos em:', getApiUrl('/students'));
      
      const response = await fetch(getApiUrl('/students'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Dados recebidos:', data);
        setStudents(data.students || []);
      } else {
        console.error('Erro na resposta:', response.status, response.statusText);
        setStudents([]);
      }
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
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

  const handleEditExercise = (exercise: Exercise) => {
    // Remove o exercício da lista de salvos
    setSavedExercises(prev => prev.filter(ex => ex.id !== exercise.id));
    
    // Adiciona o exercício de volta ao formulário para edição
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, exercise]
    }));
    
    // Define como exercício sendo editado
    setEditingExercise(exercise);
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

    if (formData.exercises.length === 0 && savedExercises.length === 0) {
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
        // Combinar exercícios em edição com exercícios salvos
        const allExercises = [...formData.exercises, ...savedExercises];
        
        const requestBody = {
          studentId: formData.studentId,
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
          // Redirecionar após 2 segundos
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
          // Redirecionar após 2 segundos
          setTimeout(() => {
            navigate('/dashboard/workouts');
          }, 2000);
        } else if (response.status === 401 || response.status === 403) {
          // Token inválido ou expirado
          localStorage.removeItem('token');
          setSuccessMessage('Sua sessão expirou. Faça login novamente.');
          setModalType('error');
          setShowSuccessModal(true);
          // Redirecionar após 2 segundos
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
        // Redirecionar após 2 segundos
        setTimeout(() => {
          navigate('/dashboard/workouts');
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

  const handleInputChange = (field: keyof NewWorkoutForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="new-workout-container">
      {/* Header */}
      <div className="new-workout-header">
        <Link
          to="/dashboard/workouts"
          className="new-workout-back-link"
        >
          <ArrowLeft size={16} />
          Voltar aos Treinos
        </Link>
      </div>

      {/* Título */}
      <div className="new-workout-title-section">
        <div className="new-workout-icon">
          <Dumbbell size={24} color="white" />
        </div>
        <h1 className="new-workout-title">
          Criar Novo Treino
        </h1>
        <p className="new-workout-subtitle">
          Configure o treino para seu aluno
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="new-workout-form">
        {/* Nome do Treino */}
        <div className="new-workout-form-group">
          <label className="new-workout-label">
            Nome do Treino *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            autoComplete="off"
            className="new-workout-input"
            style={{
              border: `1px solid ${errors.name ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)'}`
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
            <div className="new-workout-error">
              <X size={12} />
              {errors.name}
            </div>
          )}
        </div>

        {/* Descrição */}
        <div className="new-workout-form-group">
          <label className="new-workout-label">
            Descrição *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="new-workout-textarea"
            style={{
              border: `1px solid ${errors.description ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)'}`
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
            <div className="new-workout-error">
              <X size={12} />
              {errors.description}
            </div>
          )}
        </div>

        {/* Seleção de Aluno */}
        <div className="new-workout-form-group">
          <label className="new-workout-label">
            Aluno *
          </label>
          <select
            value={formData.studentId}
            onChange={(e) => handleInputChange('studentId', e.target.value)}
            className="new-workout-select"
            style={{
              border: `1px solid ${errors.studentId ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)'}`
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
            <option value="">
              {loadingStudents ? 'Carregando alunos...' : 'Selecione um aluno'}
            </option>
            {!loadingStudents && Array.isArray(students) && students.length > 0 && students.map(student => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.access_code})
              </option>
            ))}
          </select>
          {errors.studentId && (
            <div className="new-workout-error">
              <X size={12} />
              {errors.studentId}
            </div>
          )}
        </div>

        {/* Seção de Exercícios */}
        <div className="new-workout-exercises-section">
          <div className="new-workout-exercises-header">
            <h3 className="new-workout-exercises-title">
              Exercícios
            </h3>
            <button
              type="button"
              onClick={addExercise}
              className="new-workout-add-exercise-btn"
            >
              <Plus size={16} />
              Adicionar Exercício
            </button>
          </div>

          {errors.exercises && (
            <div className="new-workout-error" style={{ marginBottom: '1rem' }}>
              <X size={12} />
              <span>{errors.exercises}</span>
            </div>
          )}

          {formData.exercises.length === 0 && savedExercises.length === 0 ? (
            <div className="new-workout-empty-exercises">
              <Dumbbell size={32} style={{ marginBottom: '0.5rem' }} />
              <p>Nenhum exercício adicionado</p>
              <p style={{ fontSize: '0.75rem' }}>Clique em "Adicionar Exercício" para começar</p>
            </div>
          ) : (
            <div className="new-workout-exercises-list">
              {/* Mostrar exercícios salvos */}
              {savedExercises.map((exercise, index) => (
                <div key={`saved-${exercise.id}`} className="new-workout-exercise-item saved">
                  <div className="new-workout-exercise-header">
                    <h4>Exercício {index + 1} - {exercise.name}</h4>
                  </div>
                  <div className="new-workout-exercise-details">
                    <div className="new-workout-exercise-info">
                      <span><strong>Séries:</strong> {exercise.sets}</span>
                      <span><strong>Repetições:</strong> {exercise.reps}</span>
                      {exercise.weight && <span><strong>Peso:</strong> {exercise.weight}</span>}
                      {exercise.rest && <span><strong>Descanso:</strong> {exercise.rest}</span>}
                    </div>
                    {exercise.notes && (
                      <div className="new-workout-exercise-notes">
                        <strong>Observações:</strong> {exercise.notes}
                      </div>
                    )}
                    <div className="new-workout-exercise-actions">
                      <button
                        type="button"
                        className="new-workout-exercise-action-btn edit"
                        onClick={() => handleEditExercise(exercise)}
                        title="Editar exercício"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="new-workout-exercise-action-btn delete"
                        onClick={() => setSavedExercises(prev => prev.filter(ex => ex.id !== exercise.id))}
                        title="Excluir exercício"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Mostrar exercícios em edição */}
              {formData.exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className={`new-workout-exercise-card ${editingExercise && editingExercise.id === exercise.id ? 'editing' : ''}`}
                >
                  {/* Header do exercício */}
                  <div className="new-workout-exercise-header">
                    <h4 className="new-workout-exercise-title">
                      {editingExercise && editingExercise.id === exercise.id ? '✏️ Editando: ' : ''}
                      Exercício {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        removeExercise(exercise.id);
                        // Se estava editando este exercício, limpar o estado de edição
                        if (editingExercise && editingExercise.id === exercise.id) {
                          setEditingExercise(null);
                        }
                      }}
                      className="new-workout-remove-exercise-btn"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Campos do exercício */}
                  <div className="new-workout-exercise-fields">
                    {/* Nome do exercício */}
                    <div className="new-workout-exercise-field">
                      <label className="new-workout-exercise-label">
                        Nome *
                      </label>
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                        className="new-workout-exercise-input"
                        style={{
                          border: `1px solid ${exerciseErrors[exercise.id]?.name ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.2)'}`
                        }}
                        placeholder="Nome do exercício"
                      />
                      {exerciseErrors[exercise.id]?.name && (
                        <div className="new-workout-exercise-error">
                          {exerciseErrors[exercise.id].name}
                        </div>
                      )}
                    </div>

                    {/* Peso */}
                    <div className="new-workout-exercise-field">
                      <label className="new-workout-exercise-label">
                        Peso
                      </label>
                      <input
                        type="text"
                        value={exercise.weight}
                        onChange={(e) => updateExercise(exercise.id, 'weight', e.target.value)}
                        className="new-workout-exercise-input"
                        placeholder="Ex: 60kg"
                      />
                    </div>

                    {/* Séries */}
                    <div className="new-workout-exercise-field">
                      <label className="new-workout-exercise-label">
                        Séries *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value))}
                        className="new-workout-exercise-input"
                        style={{
                          border: `1px solid ${exerciseErrors[exercise.id]?.sets ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.2)'}`
                        }}
                      />
                      {exerciseErrors[exercise.id]?.sets && (
                        <div className="new-workout-exercise-error">
                          {exerciseErrors[exercise.id].sets}
                        </div>
                      )}
                    </div>

                    {/* Repetições */}
                    <div className="new-workout-exercise-field">
                      <label className="new-workout-exercise-label">
                        Repetições *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(exercise.id, 'reps', parseInt(e.target.value))}
                        className="new-workout-exercise-input"
                        style={{
                          border: `1px solid ${exerciseErrors[exercise.id]?.reps ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.2)'}`
                        }}
                      />
                      {exerciseErrors[exercise.id]?.reps && (
                        <div className="new-workout-exercise-error">
                          {exerciseErrors[exercise.id].reps}
                        </div>
                      )}
                    </div>

                    {/* Descanso */}
                    <div className="new-workout-exercise-field">
                      <label className="new-workout-exercise-label">
                        Descanso
                      </label>
                      <input
                        type="text"
                        value={exercise.rest}
                        onChange={(e) => updateExercise(exercise.id, 'rest', e.target.value)}
                        className="new-workout-exercise-input"
                        placeholder="Ex: 2 min"
                      />
                    </div>

                    {/* Observações */}
                    <div className="new-workout-exercise-field full-width">
                      <label className="new-workout-exercise-label">
                        Observações
                      </label>
                      <textarea
                        value={exercise.notes}
                        onChange={(e) => updateExercise(exercise.id, 'notes', e.target.value)}
                        rows={2}
                        className="new-workout-exercise-textarea"
                        placeholder="Dicas de execução, técnica, etc."
                      />
                    </div>
                  </div>

                  {/* Botão Salvar Exercício */}
                  <div style={{ 
                    marginTop: '1rem', 
                    display: 'flex', 
                    justifyContent: 'flex-end' 
                  }}>
                    <button
                      type="button"
                      disabled={savingExercise === exercise.id}
                      onClick={() => saveExercise(exercise)}
                      className="new-workout-save-exercise-btn"
                      style={{
                        background: savingExercise === exercise.id
                          ? 'rgba(59, 130, 246, 0.3)'
                          : 'linear-gradient(135deg, #3b82f6, #1e40af)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 1rem',
                        cursor: savingExercise === exercise.id ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.3s',
                        fontSize: '0.875rem'
                      }}
                      onMouseEnter={(e) => {
                        if (savingExercise !== exercise.id) {
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (savingExercise !== exercise.id) {
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      {savingExercise === exercise.id ? (
                        <>
                          <div className="new-workout-loading-spinner"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          Salvar Exercício
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="new-workout-actions">
          <Link
            to="/dashboard/workouts"
            className="new-workout-cancel-link"
          >
            Cancelar
          </Link>
          
          <button
            type="submit"
            disabled={loading}
            className="new-workout-submit-btn"
            style={{
              background: loading 
                ? 'rgba(59, 130, 246, 0.3)' 
                : 'linear-gradient(135deg, #3b82f6, #1e40af)'
            }}
          >
            {loading ? (
              <>
                <div className="new-workout-loading-spinner"></div>
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
       
       {/* Modal de Sucesso */}
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

export default NewWorkout;

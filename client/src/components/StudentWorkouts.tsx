import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Dumbbell, Clock, Target, TrendingUp, Calendar, User } from 'lucide-react';
import './StudentWorkouts.css';
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
  id: number;
  name: string;
  description: string;
  created_at: string;
  exercises: Exercise[];
}

const StudentWorkouts: React.FC = () => {
  const { accessCode } = useParams<{ accessCode: string }>();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        // Em desenvolvimento, usar backend local; em produção, usar dados estáticos
        if (process.env.NODE_ENV === 'development') {
          const response = await fetch(getApiUrl('/student-workouts/${accessCode}'));
          if (response.ok) {
            const data = await response.json();
            setWorkouts(data.workouts);
            setStudentName(data.studentName);
          } else {
            // Fallback para dados estáticos
            loadStaticWorkouts();
          }
        } else {
          // Em produção, usar dados estáticos
          loadStaticWorkouts();
        }
      } catch (error) {
        // Fallback para dados estáticos
        loadStaticWorkouts();
      } finally {
        setLoading(false);
      }
    };

    const loadStaticWorkouts = () => {
      // Mapear códigos de acesso para nomes reais
      const studentNames: { [key: string]: string } = {
        'ANA001': 'Ana Beatriz',
        'CAR002': 'Carlos Eduardo',
        'FER003': 'Fernanda Lima',
        'GAB004': 'Gabriel Santos',
        'ISA005': 'Isabela Costa',
        'LUC006': 'Lucas Mendes',
        'MAR007': 'Mariana Silva',
        'RAF008': 'Rafael Oliveira'
      };

      const studentName = studentNames[accessCode || ''] || 'Aluno';
      setStudentName(studentName);

      const testWorkouts: Workout[] = [
        {
          id: 1,
          name: 'Treino A - Força Superior',
          description: 'Foco em desenvolvimento de força para membros superiores',
          created_at: '2024-01-15',
          exercises: [
            {
              id: 1,
              name: 'Supino Reto',
              sets: 4,
              reps: 8,
              weight: '60kg',
              rest: '2 min',
              notes: 'Manter ombros para trás, cotovelos a 45°'
            },
            {
              id: 2,
              name: 'Remada Curvada',
              sets: 4,
              reps: 10,
              weight: '45kg',
              rest: '90 seg',
              notes: 'Manter costas retas, cotovelos próximos ao corpo'
            },
            {
              id: 3,
              name: 'Desenvolvimento Militar',
              sets: 3,
              reps: 12,
              weight: '30kg',
              rest: '2 min',
              notes: 'Respiração controlada, movimento completo'
            },
            {
              id: 4,
              name: 'Bíceps Curl',
              sets: 3,
              reps: 15,
              weight: '20kg',
              rest: '60 seg',
              notes: 'Cotovelos fixos, movimento controlado'
            }
          ]
        },
        {
          id: 2,
          name: 'Treino B - Inferiores',
          description: 'Desenvolvimento de força e resistência para membros inferiores',
          created_at: '2024-01-17',
          exercises: [
            {
              id: 5,
              name: 'Agachamento Livre',
              sets: 4,
              reps: 8,
              weight: '80kg',
              rest: '3 min',
              notes: 'Joelhos alinhados com pés, quadril para baixo'
            },
            {
              id: 6,
              name: 'Leg Press',
              sets: 3,
              reps: 12,
              weight: '120kg',
              rest: '2 min',
              notes: 'Pés na largura dos ombros, joelhos alinhados'
            },
            {
              id: 7,
              name: 'Extensão de Pernas',
              sets: 3,
              reps: 15,
              weight: '50kg',
              rest: '90 seg',
              notes: 'Movimento controlado, pausa no topo'
            },
            {
              id: 8,
              name: 'Flexão de Pernas',
              sets: 3,
              reps: 15,
              weight: '40kg',
              rest: '90 seg',
              notes: 'Manter quadril estável, movimento completo'
            }
          ]
        },
        {
          id: 3,
          name: 'Treino C - Cardio e Core',
          description: 'Treino de resistência cardiovascular e fortalecimento do core',
          created_at: '2024-01-19',
          exercises: [
            {
              id: 9,
              name: 'Corrida na Esteira',
              sets: 1,
              reps: 1,
              weight: undefined,
              rest: '5 min',
              notes: '20 minutos em ritmo moderado (6-7 km/h)'
            },
            {
              id: 10,
              name: 'Plank',
              sets: 3,
              reps: 1,
              weight: undefined,
              rest: '60 seg',
              notes: 'Manter corpo alinhado, 45 segundos cada'
            },
            {
              id: 11,
              name: 'Abdominal Crunch',
              sets: 3,
              reps: 20,
              weight: undefined,
              rest: '45 seg',
              notes: 'Movimento controlado, sentir o abdômen'
            },
            {
              id: 12,
              name: 'Mountain Climber',
              sets: 3,
              reps: 30,
              weight: undefined,
              rest: '60 seg',
              notes: 'Alternar pernas rapidamente, manter core ativo'
            }
          ]
        }
      ];

      setWorkouts(testWorkouts);
    };

    fetchWorkouts();
  }, [accessCode]);

  if (loading) {
    return (
      <div className="student-workouts-loading">
        <div className="student-workouts-loading-content">
          <div className="student-workouts-loading-spinner"></div>
          <p className="student-workouts-loading-text">Carregando seus treinos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-workouts-container">
      {/* Background Elements */}
      <div className="student-workouts-background"></div>
      <div className="student-workouts-background-secondary"></div>

      {/* Header */}
      <div className="student-workouts-header">
        {/* Back Button */}
        <button
          onClick={() => navigate('/register')}
          className="student-workouts-back-btn"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        {/* Student Info */}
        <div className="student-workouts-student-info">
          <div className="student-workouts-avatar">
            <User size={40} color="white" />
          </div>
          <h1 className="student-workouts-title">
            Olá, {studentName}!
          </h1>
          <p className="student-workouts-subtitle">
            Código de acesso: <strong>{accessCode}</strong>
          </p>
        </div>
      </div>

      {/* Workouts List */}
      <div className="student-workouts-content">
        <h2 className="student-workouts-section-title">
          Seus Treinos
        </h2>

        <div className="student-workouts-grid">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="student-workouts-card"
            >
              {/* Workout Header */}
              <div className="student-workouts-card-header">
                <div className="student-workouts-card-icon">
                  <Dumbbell size={24} color="white" />
                </div>
                <div className="student-workouts-card-info">
                  <h3 className="student-workouts-card-title">
                    {workout.name}
                  </h3>
                  <p className="student-workouts-card-description">
                    {workout.description}
                  </p>
                </div>
              </div>

              {/* Workout Info */}
              <div className="student-workouts-card-meta">
                <div className="student-workouts-meta-item">
                  <Calendar size={16} />
                  {new Date(workout.created_at).toLocaleDateString('pt-BR')}
                </div>
                <div className="student-workouts-meta-item">
                  <Target size={16} />
                  {workout.exercises.length} exercícios
                </div>
              </div>

              {/* Exercises List */}
              <div className="student-workouts-exercises-section">
                <h4 className="student-workouts-exercises-title">
                  <TrendingUp size={18} />
                  Exercícios
                </h4>
                
                <div className="student-workouts-exercises-list">
                  {workout.exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="student-workouts-exercise"
                    >
                      <div className="student-workouts-exercise-header">
                        <h5 className="student-workouts-exercise-name">
                          {exercise.name}
                        </h5>
                        <div className="student-workouts-exercise-badges">
                          <span className="student-workouts-badge student-workouts-badge-sets">
                            {exercise.sets} séries
                          </span>
                          <span className="student-workouts-badge student-workouts-badge-reps">
                            {exercise.reps} reps
                          </span>
                        </div>
                      </div>
                      
                      <div className="student-workouts-exercise-details">
                        {exercise.weight && (
                          <div className="student-workouts-detail-item">
                            <Dumbbell size={14} />
                            {exercise.weight}
                          </div>
                        )}
                        <div className="student-workouts-detail-item">
                          <Clock size={14} />
                          Descanso: {exercise.rest}
                        </div>
                      </div>
                      
                      {exercise.notes && (
                        <p className="student-workouts-exercise-notes">
                          💡 {exercise.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Workouts Message */}
        {workouts.length === 0 && (
          <div className="student-workouts-empty">
            <Dumbbell size={64} />
            <h3>Nenhum treino encontrado</h3>
            <p>Entre em contato com seu personal trainer para receber seus treinos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentWorkouts;

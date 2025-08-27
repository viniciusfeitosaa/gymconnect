import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Dumbbell, Clock, Target, TrendingUp, Calendar, User } from 'lucide-react';
import './StudentWorkouts.css';

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
          const response = await fetch(`/api/student-workouts/${accessCode}`);
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
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #020617 0%, #0c1421 25%, #1e293b 50%, #0c1421 75%, #020617 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid transparent',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Carregando seus treinos...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020617 0%, #0c1421 25%, #1e293b 50%, #0c1421 75%, #020617 100%)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
        animation: 'pulse 4s ease-in-out infinite alternate'
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '-50%',
        left: '-50%',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(30, 58, 138, 0.08) 0%, transparent 70%)',
        animation: 'pulse 4s ease-in-out infinite alternate-reverse'
      }}></div>

      {/* Header */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        marginBottom: '2rem'
      }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/register')}
          style={{
            background: 'rgba(2, 6, 23, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            color: '#e2e8f0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s',
            marginBottom: '2rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
            e.currentTarget.style.backgroundColor = 'rgba(2, 6, 23, 0.98)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
            e.currentTarget.style.backgroundColor = 'rgba(2, 6, 23, 0.95)';
          }}
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        {/* Student Info */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '5rem',
            height: '5rem',
            borderRadius: '1.5rem',
            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
            marginBottom: '1rem',
            boxShadow: '0 25px 50px rgba(59, 130, 246, 0.3)'
          }}>
            <User size={40} color="white" />
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #ffffff, #93c5fd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            Olá, {studentName}!
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '1.125rem'
          }}>
            Código de acesso: <strong>{accessCode}</strong>
          </p>
        </div>
      </div>

      {/* Workouts List */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          color: '#f1f5f9',
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          Seus Treinos
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem'
        }}>
          {workouts.map((workout) => (
            <div
              key={workout.id}
              style={{
                backgroundColor: 'rgba(2, 6, 23, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '1.5rem',
                padding: '2rem',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)',
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
              {/* Workout Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Dumbbell size={24} color="white" />
                </div>
                <div>
                  <h3 style={{
                    color: '#f1f5f9',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem'
                  }}>
                    {workout.name}
                  </h3>
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '0.875rem'
                  }}>
                    {workout.description}
                  </p>
                </div>
              </div>

              {/* Workout Info */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#94a3b8',
                  fontSize: '0.875rem'
                }}>
                  <Calendar size={16} />
                  {new Date(workout.created_at).toLocaleDateString('pt-BR')}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#94a3b8',
                  fontSize: '0.875rem'
                }}>
                  <Target size={16} />
                  {workout.exercises.length} exercícios
                </div>
              </div>

              {/* Exercises List */}
              <div>
                <h4 style={{
                  color: '#e2e8f0',
                  fontSize: '1rem',
                  fontWeight: '500',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <TrendingUp size={18} />
                  Exercícios
                </h4>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  {workout.exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                        e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                        e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.5rem'
                      }}>
                        <h5 style={{
                          color: '#f1f5f9',
                          fontSize: '1rem',
                          fontWeight: '500',
                          flex: 1
                        }}>
                          {exercise.name}
                        </h5>
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            color: '#93c5fd',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            {exercise.sets} séries
                          </span>
                          <span style={{
                            backgroundColor: 'rgba(34, 197, 94, 0.2)',
                            color: '#86efac',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            {exercise.reps} reps
                          </span>
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        flexWrap: 'wrap',
                        fontSize: '0.875rem'
                      }}>
                        {exercise.weight && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: '#94a3b8'
                          }}>
                            <Dumbbell size={14} />
                            {exercise.weight}
                          </div>
                        )}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          color: '#94a3b8'
                        }}>
                          <Clock size={14} />
                          Descanso: {exercise.rest}
                        </div>
                      </div>
                      
                      {exercise.notes && (
                        <p style={{
                          color: '#cbd5e1',
                          fontSize: '0.875rem',
                          marginTop: '0.5rem',
                          fontStyle: 'italic'
                        }}>
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
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#94a3b8'
          }}>
            <Dumbbell size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Nenhum treino encontrado</h3>
            <p>Entre em contato com seu personal trainer para receber seus treinos.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.2; }
          100% { opacity: 0.4; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default StudentWorkouts;

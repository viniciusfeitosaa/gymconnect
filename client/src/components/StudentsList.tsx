import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Copy, Check, Users, Search, ArrowLeft, Calendar, Target, Trash2 } from 'lucide-react';
import './StudentsList.css';

interface Student {
  id: string;
  name: string;
  access_code: string;
  email?: string;
  phone?: string;
  created_at?: string;
  personal_id?: string;
}

const StudentsList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Usar a API real tanto em desenvolvimento quanto em produção
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/students' 
        : '/.netlify/functions/api/students';
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      } else if (response.status === 401) {
        // Token inválido ou expirado
        console.error('Token inválido ou expirado');
        setStudents([]);
      } else {
        console.error('Erro ao carregar alunos:', response.status);
        setStudents([]);
      }
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };



  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      // Erro ao copiar para área de transferência
    }
  };

  const openDeleteModal = (student: Student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    try {
      // Usar a API real tanto em desenvolvimento quanto em produção
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? `http://localhost:5000/api/students/${studentToDelete.id}` 
        : `/.netlify/functions/api/students/${studentToDelete.id}`;
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Remover aluno da lista local
        setStudents(students.filter(student => student.id !== studentToDelete.id));
        closeDeleteModal();
      } else {
        alert('Erro ao excluir aluno');
      }
    } catch (error) {
      alert('Erro ao excluir aluno');
      closeDeleteModal();
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.access_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="students-loading" style={{
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
          onClick={fetchStudents}
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

  return (
    <div className="students-container">
      {/* Header */}
      <div className="students-header">
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
          to="/dashboard/students/new"
          className="students-create-btn"
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
          Adicionar Aluno
        </Link>
      </div>

      {/* Título e estatísticas */}
      <div style={{
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div className="students-icon" style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
          marginBottom: '1rem'
        }}>
          <Users size={24} color="white" />
        </div>
        <h1 className="students-title" style={{
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '0.5rem'
        }}>
          Gerenciar Alunos
        </h1>
        <p className="students-subtitle" style={{
          color: '#94a3b8'
        }}>
          {students.length} aluno{students.length !== 1 ? 's' : ''} cadastrado{students.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Barra de pesquisa */}
      <div className="students-search">
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
            placeholder="Buscar por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="students-search-input"
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

      {/* Lista de alunos */}
      {filteredStudents.length === 0 ? (
        <div className="students-empty" style={{
          textAlign: 'center',
          backgroundColor: 'rgba(2, 6, 23, 0.6)',
          borderRadius: '1rem',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <Users size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#94a3b8',
            marginBottom: '0.5rem'
          }}>
            Nenhum aluno encontrado
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: '0.875rem'
          }}>
            {searchTerm ? 'Tente ajustar os termos de busca.' : 'Comece adicionando seu primeiro aluno.'}
          </p>
        </div>
      ) : (
        <div className="students-grid" style={{
          display: 'grid'
        }}>
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="student-card"
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
              <div className="student-card-header" style={{
                display: 'flex',
                marginBottom: '1rem'
              }}>
                <div>
                  <h3 className="student-card-title" style={{
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '0.25rem'
                  }}>
                    {student.name}
                  </h3>
                  <p style={{
                    color: '#64748b',
                    fontSize: '0.75rem'
                  }}>
                    {student.created_at ? `Cadastrado em ${formatDate(student.created_at)}` : 'Aluno cadastrado'}
                  </p>
                </div>
              </div>

              {/* Informações do aluno */}
              <div className="student-info" style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                {/* Código de acesso */}
                <div className="student-code-section" style={{
                  display: 'flex',
                  marginBottom: '0.75rem'
                }}>
                  <div>
                    <div className="student-code-label" style={{
                      color: '#94a3b8',
                      marginBottom: '0.25rem'
                    }}>
                      Código de Acesso
                    </div>
                    <div className="student-code-display" style={{
                      color: 'white',
                      fontFamily: 'monospace',
                      fontWeight: '600'
                    }}>
                      {student.access_code}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(student.access_code)}
                    className="student-copy-btn"
                    style={{
                      background: copiedCode === student.access_code 
                        ? 'rgba(34, 197, 94, 0.2)' 
                        : 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid',
                      borderColor: copiedCode === student.access_code 
                        ? 'rgba(34, 197, 94, 0.4)' 
                        : 'rgba(59, 130, 246, 0.3)',
                      color: copiedCode === student.access_code ? '#4ade80' : '#60a5fa',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      if (copiedCode !== student.access_code) {
                        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (copiedCode !== student.access_code) {
                        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                      }
                    }}
                  >
                    {copiedCode === student.access_code ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>

                {/* Detalhes do aluno */}
                <div className="student-details-grid" style={{
                  display: 'grid'
                }}>
                  {student.email && (
                    <div className="student-detail-item" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      color: '#86efac'
                    }}>
                      <Users className="student-detail-icon" size={12} />
                      {student.email}
                    </div>
                  )}
                  {student.phone && (
                    <div className="student-detail-item" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      color: '#94a3b8'
                    }}>
                      <Calendar className="student-detail-icon" size={12} />
                      {student.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="student-card-actions" style={{
                display: 'flex'
              }}>
                <Link
                  to={`/dashboard/students/${student.id}/workouts`}
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
                  Ver Treinos
                </Link>
                
                <Link
                  to={`/dashboard/students/${student.id}/workouts/create`}
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
                  Criar Treino
                </Link>

                <button
                  onClick={() => openDeleteModal(student)}
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
                  title="Excluir aluno"
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
        
        @keyframes modalSlideIn {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && studentToDelete && (
        <div className="students-modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="students-modal-content" style={{
            backgroundColor: 'rgba(2, 6, 23, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '1rem',
            textAlign: 'center',
            animation: 'modalSlideIn 0.3s ease-out'
          }}>
            {/* Ícone de Aviso */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              marginBottom: '1.5rem'
            }}>
              <Trash2 size={24} color="#fca5a5" />
            </div>

            {/* Título */}
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '0.75rem'
            }}>
              Excluir Aluno
            </h3>

            {/* Mensagem */}
            <p style={{
              color: '#94a3b8',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              marginBottom: '2rem'
            }}>
              Tem certeza que deseja excluir <strong style={{ color: 'white' }}>{studentToDelete.name}</strong>?
              <br />
              <span style={{ color: '#fca5a5', fontSize: '0.75rem' }}>
                Esta ação não pode ser desfeita.
              </span>
            </p>

            {/* Botões */}
            <div className="students-modal-actions" style={{
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                onClick={closeDeleteModal}
                className="students-modal-btn"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: '#94a3b8',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
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
              </button>

              <button
                onClick={handleDeleteStudent}
                className="students-modal-btn"
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
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
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsList;

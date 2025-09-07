import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Camera,
  CreditCard,
  Crown,
  Zap,
  Lock,
} from 'lucide-react';
import './PersonalProfile.css';
import { getApiUrl } from '../utils/api';
import { usePlan } from '../contexts/PlanContext';

interface PersonalProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  specialties?: string[];
  experience?: string;
  certifications?: string[];
}

const PersonalProfile: React.FC = () => {
  const { currentPlan } = usePlan();

  const [profile, setProfile] = useState<PersonalProfile>({
    id: '',
    name: '',
    email: '',
    phone: 'Não informado',
    location: 'Não informado',
    bio: 'Não informado',
    specialties: ['Não informado'],
    experience: 'Não informado',
    certifications: ['Não informado'],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<PersonalProfile>(profile);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      // Buscar dados do usuário logado
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token não encontrado');
        return;
      }

      const response = await fetch(getApiUrl('/auth/me'), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user; // A resposta vem como { user: {...} }

        // Criar perfil com dados reais do banco
        const realProfile: PersonalProfile = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: 'Não informado',
          location: 'Não informado',
          bio: 'Não informado',
          specialties: ['Não informado'],
          experience: 'Não informado',
          certifications: ['Não informado'],
        };

        setProfile(realProfile);
        setEditedProfile(realProfile);
      } else {
        console.error('Erro ao buscar dados do usuário');
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Implementar salvamento na API quando disponível
      // const response = await fetch('/api/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editedProfile)
      // });

      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProfile(editedProfile);
      setIsEditing(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (
    field: keyof PersonalProfile,
    value: string | string[]
  ) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const addSpecialty = () => {
    const newSpecialty = prompt('Digite uma nova especialidade:');
    if (newSpecialty && newSpecialty.trim()) {
      handleInputChange('specialties', [
        ...(editedProfile.specialties || []),
        newSpecialty.trim(),
      ]);
    }
  };

  const removeSpecialty = (index: number) => {
    const newSpecialties =
      editedProfile.specialties?.filter((_, i) => i !== index) || [];
    handleInputChange('specialties', newSpecialties);
  };

  const addCertification = () => {
    const newCert = prompt('Digite uma nova certificação:');
    if (newCert && newCert.trim()) {
      handleInputChange('certifications', [
        ...(editedProfile.certifications || []),
        newCert.trim(),
      ]);
    }
  };

  const removeCertification = (index: number) => {
    const newCerts =
      editedProfile.certifications?.filter((_, i) => i !== index) || [];
    handleInputChange('certifications', newCerts);
  };

  const getPlanInfo = (planId: string) => {
    switch (planId) {
      case 'free':
        return {
          name: 'Plano Gratuito',
          icon: Lock,
          color: '#64748b',
          bgColor: 'rgba(100, 116, 139, 0.1)',
          borderColor: 'rgba(100, 116, 139, 0.3)',
          description: '1 aluno disponível',
        };
      case 'basic':
        return {
          name: 'Plano Básico',
          icon: Zap,
          color: '#3b82f6',
          bgColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          description: 'Até 4 alunos',
        };
      case 'premium':
        return {
          name: 'Plano Premium',
          icon: Crown,
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
          description: 'Alunos ilimitados',
        };
      default:
        return {
          name: 'Plano Gratuito',
          icon: Lock,
          color: '#64748b',
          bgColor: 'rgba(100, 116, 139, 0.1)',
          borderColor: 'rgba(100, 116, 139, 0.3)',
          description: '1 aluno disponível',
        };
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            fontSize: '1.2rem',
            color: '#64748b',
          }}
        >
          Carregando perfil...
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '0.875rem',
            transition: 'color 0.3s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#e2e8f0';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <ArrowLeft size={16} />
          Voltar ao Dashboard
        </Link>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#60a5fa',
              padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 4vw, 1.5rem)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
              fontWeight: '500',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
            }}
          >
            <Edit size={16} />
            Editar Perfil
          </button>
        )}
      </div>

      {/* Título */}
      <div
        style={{
          marginBottom: '2rem',
          textAlign: 'center',
        }}
      >
        <div
          className="profile-avatar"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
            marginBottom: '1rem',
          }}
        >
          <User size={24} color="white" />
        </div>
        <h1
          className="profile-title"
          style={{
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem',
          }}
        >
          Meu Perfil
        </h1>
        <p
          className="profile-subtitle"
          style={{
            color: '#94a3b8',
          }}
        >
          Gerencie suas informações pessoais e profissionais
        </p>
      </div>

      {/* Plano Atual */}
      <div
        style={{
          marginBottom: '2rem',
          textAlign: 'center',
        }}
      >
        {(() => {
          const planInfo = getPlanInfo(currentPlan?.id || 'free');
          return (
            <div
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                borderRadius: '1rem',
                border: `1px solid ${planInfo.borderColor}`,
                backgroundColor: planInfo.bgColor,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.5rem',
                }}
              >
                {React.createElement(planInfo.icon, {
                  size: 20,
                  color: planInfo.color,
                })}
                <span
                  style={{
                    color: planInfo.color,
                    fontWeight: '600',
                    fontSize: '1rem',
                  }}
                >
                  {planInfo.name}
                </span>
              </div>
              <p
                style={{
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  margin: '0',
                }}
              >
                {planInfo.description}
              </p>
            </div>
          );
        })()}

        <div
          style={{
            marginTop: '1rem',
          }}
        >
          <Link
            to="/dashboard/plans"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#60a5fa',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'color 0.3s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#93c5fd';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#60a5fa';
            }}
          >
            <CreditCard size={16} />
            Gerenciar Plano
          </Link>
        </div>
      </div>

      {/* Formulário/Perfil */}
      <div
        className="profile-form"
        style={{
          backgroundColor: 'rgba(2, 6, 23, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '1rem',
        }}
      >
        {/* Foto de Perfil */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
            }}
          >
            <div
              style={{
                width: '8rem',
                height: '8rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <User size={48} color="white" />
            </div>
            {isEditing && (
              <button
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  background: 'rgba(59, 130, 246, 0.9)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Camera size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Informações Básicas */}
        <div
          className="profile-grid"
          style={{
            display: 'grid',
            marginBottom: '2rem',
          }}
        >
          {/* Nome */}
          <div>
            <label
              style={{
                display: 'block',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
              }}
            >
              Nome Completo
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.name}
                onChange={e => handleInputChange('name', e.target.value)}
                className="profile-input"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '1rem',
                  transition: 'all 0.3s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
                }}
              />
            ) : (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '1rem',
                }}
              >
                {profile.name}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              style={{
                display: 'block',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
              }}
            >
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editedProfile.email}
                onChange={e => handleInputChange('email', e.target.value)}
                className="profile-input"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '1rem',
                  transition: 'all 0.3s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
                }}
              />
            ) : (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '1rem',
                }}
              >
                {profile.email}
              </div>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label
              style={{
                display: 'block',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
              }}
            >
              Telefone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={editedProfile.phone || ''}
                onChange={e => handleInputChange('phone', e.target.value)}
                className="profile-input"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '1rem',
                  transition: 'all 0.3s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
                }}
                placeholder="(11) 99999-1111"
              />
            ) : (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '1rem',
                }}
              >
                {profile.phone || 'Não informado'}
              </div>
            )}
          </div>

          {/* Localização */}
          <div>
            <label
              style={{
                display: 'block',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
              }}
            >
              Localização
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.location || ''}
                onChange={e => handleInputChange('location', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '1rem',
                  transition: 'all 0.3s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
                }}
                placeholder="São Paulo, SP"
              />
            ) : (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '1rem',
                }}
              >
                {profile.location || 'Não informado'}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div style={{ marginBottom: '2rem' }}>
          <label
            style={{
              display: 'block',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
            }}
          >
            Biografia
          </label>
          {isEditing ? (
            <textarea
              value={editedProfile.bio || ''}
              onChange={e => handleInputChange('bio', e.target.value)}
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
                transition: 'all 0.3s',
                fontFamily: 'inherit',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
              }}
              placeholder="Conte um pouco sobre você..."
            />
          ) : (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '1rem',
                lineHeight: '1.5',
              }}
            >
              {profile.bio || 'Nenhuma biografia informada'}
            </div>
          )}
        </div>

        {/* Especialidades */}
        <div style={{ marginBottom: '2rem' }}>
          <label
            style={{
              display: 'block',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
            }}
          >
            Especialidades
          </label>
          <div className="profile-tags">
            {(isEditing ? editedProfile.specialties : profile.specialties)?.map(
              (specialty, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '1rem',
                    padding: '0.5rem 1rem',
                    color: '#60a5fa',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {specialty}
                  {isEditing && (
                    <button
                      onClick={() => removeSpecialty(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )
            )}
            {isEditing && (
              <button
                onClick={addSpecialty}
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px dashed rgba(59, 130, 246, 0.3)',
                  borderRadius: '1rem',
                  padding: '0.5rem 1rem',
                  color: '#60a5fa',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                }}
              >
                + Adicionar
              </button>
            )}
          </div>
        </div>

        {/* Experiência */}
        <div style={{ marginBottom: '2rem' }}>
          <label
            style={{
              display: 'block',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
            }}
          >
            Tempo de Experiência
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedProfile.experience || ''}
              onChange={e => handleInputChange('experience', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '1rem',
                transition: 'all 0.3s',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
              }}
              placeholder="5+ anos"
            />
          ) : (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '1rem',
              }}
            >
              {profile.experience || 'Não informado'}
            </div>
          )}
        </div>

        {/* Certificações */}
        <div style={{ marginBottom: '2rem' }}>
          <label
            style={{
              display: 'block',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
            }}
          >
            Certificações
          </label>
          <div className="profile-certifications">
            {(isEditing
              ? editedProfile.certifications
              : profile.certifications
            )?.map((cert, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#4ade80',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {cert}
                {isEditing && (
                  <button
                    onClick={() => removeCertification(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            {isEditing && (
              <button
                onClick={addCertification}
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px dashed rgba(34, 197, 94, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: '#4ade80',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(34, 197, 94, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(34, 197, 94, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)';
                }}
              >
                + Adicionar Certificação
              </button>
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        {isEditing && (
          <div
            className="profile-actions"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              onClick={handleCancel}
              style={{
                border: '1px solid rgba(148, 163, 184, 0.3)',
                color: '#94a3b8',
                padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 4vw, 1.5rem)',
                borderRadius: '0.5rem',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                fontWeight: '500',
                transition: 'all 0.3s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor =
                  'rgba(148, 163, 184, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.5)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
              }}
            >
              Cancelar
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                background: loading
                  ? 'rgba(59, 130, 246, 0.3)'
                  : 'linear-gradient(135deg, #3b82f6, #1e40af)',
                color: 'white',
                border: 'none',
                padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 4vw, 1.5rem)',
                borderRadius: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={e => {
                if (!loading) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  ></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Salvar Alterações
                </>
              )}
            </button>
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

export default PersonalProfile;

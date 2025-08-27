const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend local funcionando!', timestamp: new Date().toISOString() });
});

// Rota de login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Credenciais fixas para teste
  if (email === 'admin@teste.com' && password === 'admin123') {
    res.json({
      user: {
        id: 1,
        name: 'Admin',
        email: 'admin@teste.com'
      },
      token: 'test-token-123'
    });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

// Rota para estatísticas do dashboard
app.get('/api/dashboard/stats', (req, res) => {
  // Simular dados reais do banco de dados
  // Em um sistema real, isso viria de consultas SQL
  
  // Simular que o personal tem alunos
  const hasStudents = true; // true = com alunos, false = sem alunos
  
  if (!hasStudents) {
    // Personal sem alunos
    const emptyStats = {
      totalStudents: 0,
      totalWorkouts: 0,
      recentStudents: [],
      message: "Você ainda não tem alunos cadastrados. Comece adicionando seu primeiro aluno!"
    };
    
    return res.json(emptyStats);
  }
  
  // Simular personal com alunos (quando hasStudents = true)
  const dashboardStats = {
    totalStudents: 3,
    totalWorkouts: 7,
    recentStudents: [
      { id: '1', name: 'Ana Beatriz', accessCode: 'ANA001', workoutCount: 3 },
      { id: '2', name: 'Carlos Eduardo', accessCode: 'CAR002', workoutCount: 2 },
      { id: '3', name: 'Fernanda Lima', accessCode: 'FER003', workoutCount: 2 }
    ],
    message: "Seus alunos estão progredindo bem! Continue criando treinos personalizados."
  };
  
  res.json(dashboardStats);
});

// Rota para listar todos os alunos
app.get('/api/students', (req, res) => {
  // Simular dados reais de alunos
  const students = [
    {
      id: '1',
      name: 'Ana Beatriz',
      accessCode: 'ANA001',
      joinDate: '2024-01-15',
      workoutCount: 3,
      lastWorkout: '2024-01-20',
      status: 'active'
    },
    {
      id: '2',
      name: 'Carlos Eduardo',
      accessCode: 'CAR002',
      joinDate: '2024-01-10',
      workoutCount: 2,
      lastWorkout: '2024-01-18',
      status: 'active'
    },
    {
      id: '3',
      name: 'Fernanda Lima',
      accessCode: 'FER003',
      joinDate: '2024-01-12',
      workoutCount: 2,
      lastWorkout: '2024-01-19',
      status: 'active'
    }
  ];
  
  res.json({ students });
});

// Rota para criar novo aluno
app.post('/api/students', (req, res) => {
  const { name, accessCode, notes, joinDate, status } = req.body;
  
  // Validações básicas
  if (!name || !accessCode) {
    return res.status(400).json({ 
      error: 'Nome e código de acesso são obrigatórios' 
    });
  }
  
  // Em um sistema real, isso salvaria no banco de dados
  // Por enquanto, apenas retornamos sucesso
  console.log('Novo aluno criado:', {
    name,
    accessCode,
    notes,
    joinDate,
    status
  });
  
  res.status(201).json({ 
    message: 'Aluno criado com sucesso',
    student: {
      id: Date.now().toString(),
      name,
      accessCode,
      notes,
      joinDate,
      status,
      workoutCount: 0,
      lastWorkout: null
    }
  });
});

// Rota para excluir aluno
app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  
  // Em um sistema real, isso excluiria do banco de dados
  // Por enquanto, apenas retornamos sucesso
  console.log(`Aluno ${id} excluído com sucesso`);
  
  res.json({ message: 'Aluno excluído com sucesso' });
});

// Rota para listar todos os treinos
app.get('/api/workouts', (req, res) => {
  // Simular dados reais de treinos
  const workouts = [
    {
      id: '1',
      name: 'Treino A - Força Superior',
      description: 'Foco em desenvolvimento de força para membros superiores',
      studentName: 'Ana Beatriz',
      studentAccessCode: 'ANA001',
      created_at: '2024-01-15',
      exercises: [
        { id: 1, name: 'Supino Reto', sets: 4, reps: 8, weight: '60kg', rest: '2 min', notes: 'Manter ombros para trás' },
        { id: 2, name: 'Remada Curvada', sets: 4, reps: 10, weight: '45kg', rest: '90 seg', notes: 'Costas retas' }
      ]
    },
    {
      id: '2',
      name: 'Treino B - Inferiores',
      description: 'Desenvolvimento de força para membros inferiores',
      studentName: 'Carlos Eduardo',
      studentAccessCode: 'CAR002',
      created_at: '2024-01-17',
      exercises: [
        { id: 3, name: 'Agachamento Livre', sets: 4, reps: 8, weight: '80kg', rest: '3 min', notes: 'Joelhos alinhados' },
        { id: 4, name: 'Leg Press', sets: 3, reps: 12, weight: '120kg', rest: '2 min', notes: 'Pés na largura dos ombros' }
      ]
    },
    {
      id: '3',
      name: 'Treino C - Cardio e Core',
      description: 'Treino de resistência cardiovascular e core',
      studentName: 'Fernanda Lima',
      studentAccessCode: 'FER003',
      created_at: '2024-01-19',
      exercises: [
        { id: 5, name: 'Corrida na Esteira', sets: 1, reps: 1, rest: '5 min', notes: '20 minutos em ritmo moderado' },
        { id: 6, name: 'Plank', sets: 3, reps: 1, rest: '60 seg', notes: '45 segundos cada' }
      ]
    }
  ];
  
  res.json({ workouts });
});

// Rota para criar novo treino
app.post('/api/workouts', (req, res) => {
  const { name, description, studentId, exercises, created_at } = req.body;
  
  // Validações básicas
  if (!name || !description || !studentId || !exercises || exercises.length === 0) {
    return res.status(400).json({ 
      error: 'Nome, descrição, aluno e exercícios são obrigatórios' 
    });
  }
  
  // Em um sistema real, isso salvaria no banco de dados
  // Por enquanto, apenas retornamos sucesso
  console.log('Novo treino criado:', {
    name,
    description,
    studentId,
    exercises,
    created_at
  });
  
  res.status(201).json({ 
    message: 'Treino criado com sucesso',
    workout: {
      id: Date.now().toString(),
      name,
      description,
      studentId,
      exercises,
      created_at
    }
  });
});

// Rota para excluir treino
app.delete('/api/workouts/:id', (req, res) => {
  const { id } = req.params;
  
  // Em um sistema real, isso excluiria do banco de dados
  // Por enquanto, apenas retornamos sucesso
  console.log(`Treino ${id} excluído com sucesso`);
  
  res.json({ message: 'Treino excluído com sucesso' });
});

// Rota para treinos de teste
app.get('/api/student-workouts/:accessCode', (req, res) => {
  const { accessCode } = req.params;
  
  // Mapear códigos de acesso para nomes reais
  const studentNames = {
    'ANA001': 'Ana Beatriz',
    'CAR002': 'Carlos Eduardo',
    'FER003': 'Fernanda Lima',
    'GAB004': 'Gabriel Santos',
    'ISA005': 'Isabela Costa',
    'LUC006': 'Lucas Mendes',
    'MAR007': 'Mariana Silva',
    'RAF008': 'Rafael Oliveira'
  };

  const studentName = studentNames[accessCode] || 'Aluno';
  
  // Dados de teste baseados no código de acesso
  const testWorkouts = [
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
          id: 3,
          name: 'Agachamento Livre',
          sets: 4,
          reps: 8,
          weight: '80kg',
          rest: '3 min',
          notes: 'Joelhos alinhados com pés, quadril para baixo'
        },
        {
          id: 4,
          name: 'Leg Press',
          sets: 3,
          reps: 12,
          weight: '120kg',
          rest: '2 min',
          notes: 'Pés na largura dos ombros, joelhos alinhados'
        }
      ]
    }
  ];
  
  res.json({
    studentName: studentName,
    workouts: testWorkouts
  });
});

// Servir arquivos estáticos do React (para produção)
app.use(express.static(path.join(__dirname, 'client/build')));

// Rota catch-all para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔧 Backend: http://localhost:${PORT}`);
  console.log(`📊 API Test: http://localhost:${PORT}/api/test`);
});

const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3001;

// Chave secreta para JWT (em produção, usar variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'gymconnect-secret-key-2024';

// Dados em memória para simular banco de dados
let personals = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@academia.com',
    password: '$2b$10$4C1Iq8uJuG7/70xj80MkfOSDq3ZlGf8RA5BgjjMyN8hQ8w23VYDJi', // hash de 'Admin123!'
    createdAt: '2024-01-01'
  }
];

let students = [
  {
    id: '1',
    personalId: '1', // Vincular ao personal João Silva
    name: 'Ana Beatriz',
    accessCode: 'ANA001',
    joinDate: '2024-01-15',
    workoutCount: 3,
    lastWorkout: '2024-01-20',
    status: 'active'
  },
  {
    id: '2',
    personalId: '1', // Vincular ao personal João Silva
    name: 'Carlos Eduardo',
    accessCode: 'CAR002',
    joinDate: '2024-01-10',
    workoutCount: 2,
    lastWorkout: '2024-01-18',
    status: 'active'
  },
  {
    id: '3',
    personalId: '1', // Vincular ao personal João Silva
    name: 'Fernanda Lima',
    accessCode: 'FER003',
    joinDate: '2024-01-12',
    workoutCount: 2,
    lastWorkout: '2024-01-19',
    status: 'active'
  }
];

// Dados de treinos em memória (vincular aos personais)
let workouts = [
  {
    id: '1',
    personalId: '1', // João Silva
    studentId: '1', // Ana Beatriz
    name: 'Treino A - Força Superior',
    description: 'Foco em desenvolvimento de força para membros superiores',
    created_at: '2024-01-15',
    exercises: [
      { id: 1, name: 'Supino Reto', sets: 4, reps: 8, weight: '60kg', rest: '2 min', notes: 'Manter ombros para trás' },
      { id: 2, name: 'Remada Curvada', sets: 4, reps: 10, weight: '45kg', rest: '90 seg', notes: 'Costas retas' }
    ]
  },
  {
    id: '2',
    personalId: '1', // João Silva
    studentId: '2', // Carlos Eduardo
    name: 'Treino B - Inferiores',
    description: 'Desenvolvimento de força para membros inferiores',
    created_at: '2024-01-17',
    exercises: [
      { id: 3, name: 'Agachamento Livre', sets: 4, reps: 8, weight: '80kg', rest: '3 min', notes: 'Joelhos alinhados' },
      { id: 4, name: 'Leg Press', sets: 3, reps: 12, weight: '120kg', rest: '2 min', notes: 'Pés na largura dos ombros' }
    ]
  },
  {
    id: '3',
    personalId: '1', // João Silva
    studentId: '3', // Fernanda Lima
    name: 'Treino C - Cardio e Core',
    description: 'Treino de resistência cardiovascular e core',
    created_at: '2024-01-19',
    exercises: [
      { id: 5, name: 'Corrida na Esteira', sets: 1, reps: 1, rest: '5 min', notes: '20 minutos em ritmo moderado' },
      { id: 6, name: 'Plank', sets: 3, reps: 1, rest: '60 seg', notes: '45 segundos cada' }
    ]
  }
];

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de logging para produção (mais discreto)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Middleware de autenticação JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
    
    // Adicionar dados do usuário ao request
    req.user = user;
    next();
  });
};

// Rota de teste para health check
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend funcionando!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Rota para health check detalhado
app.get('/api/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
    memory: process.memoryUsage(),
    version: process.version
  };
  
  res.json(health);
});

// Rota para registro de novos personais
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validações básicas
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Nome, email e senha são obrigatórios' 
      });
    }
    
    // Verificar se o email já existe
    const existingPersonal = personals.find(p => p.email === email);
    if (existingPersonal) {
      return res.status(400).json({ 
        error: 'Email já cadastrado' 
      });
    }
    
    // Hash da senha com bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Criar novo personal
    const newPersonal = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    // Adicionar à lista
    personals.push(newPersonal);
    
    res.status(201).json({ 
      message: 'Personal registrado com sucesso',
      personal: {
        id: newPersonal.id,
        name: newPersonal.name,
        email: newPersonal.email,
        createdAt: newPersonal.createdAt
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao criar conta'
    });
  }
});

// Rota para login de personais
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Encontrar o personal pelo email
    const personal = personals.find(p => p.email === email);
    
    if (!personal) {
      return res.status(401).json({ error: 'Email não encontrado' });
    }
    
    // Verificar senha com bcrypt
    const isValidPassword = await bcrypt.compare(password, personal.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }
    
    // Gerar token JWT real
    const token = jwt.sign(
      { 
        id: personal.id, 
        email: personal.email,
        name: personal.name 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.json({
      user: {
        id: personal.id,
        name: personal.name,
        email: personal.email
      },
      token: token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao fazer login'
    });
  }
});

// Rota para estatísticas do dashboard (PROTEGIDA)
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  try {
    // Filtrar apenas alunos do personal logado
    const personalId = req.user.id;
    const personalStudents = students.filter(student => student.personalId === personalId);
    
    // Verificar se o personal tem alunos
    const hasStudents = personalStudents.length > 0;
    
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
    
    // Personal com alunos - usar dados reais filtrados
    const personalWorkouts = workouts.filter(workout => workout.personalId === personalId);
    
    const dashboardStats = {
      totalStudents: personalStudents.length,
      totalWorkouts: personalWorkouts.length, // Contar treinos reais
      recentStudents: personalStudents.slice(0, 3).map(student => ({
        id: student.id,
        name: student.name,
        accessCode: student.accessCode,
        workoutCount: personalWorkouts.filter(w => w.studentId === student.id).length // Contar treinos do aluno
      })),
      message: "Seus alunos estão progredindo bem! Continue criando treinos personalizados."
    };
    
    res.json(dashboardStats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar todos os alunos (PROTEGIDA)
app.get('/api/students', authenticateToken, (req, res) => {
  try {
    // Filtrar alunos apenas do personal logado
    const personalId = req.user.id;
    const personalStudents = students.filter(student => student.personalId === personalId);
    
    res.json({ students: personalStudents });
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para criar novo aluno (PROTEGIDA)
app.post('/api/students', authenticateToken, (req, res) => {
  try {
    const { name, accessCode, notes, joinDate, status } = req.body;
    
    // Validações básicas
    if (!name || !accessCode) {
      return res.status(400).json({ 
        error: 'Nome e código de acesso são obrigatórios' 
      });
    }
    
    // Usar o ID do personal logado (do token)
    const personalId = req.user.id;
    
    // Criar novo aluno
    const newStudent = {
      id: Date.now().toString(),
      personalId, // Vincular ao personal
      name,
      accessCode,
      notes,
      joinDate,
      status,
      workoutCount: 0,
      lastWorkout: null
    };
    
    // Adicionar à lista em memória
    students.push(newStudent);
    
    res.status(201).json({ 
      message: 'Aluno criado com sucesso',
      student: newStudent
    });
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para excluir aluno (PROTEGIDA)
app.delete('/api/students/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o aluno pertence ao personal logado
    const personalId = req.user.id;
    const student = students.find(s => s.id === id && s.personalId === personalId);
    
    if (!student) {
      return res.status(404).json({ error: 'Aluno não encontrado ou não autorizado' });
    }
    
    // Encontrar e remover o aluno da lista
    const studentIndex = students.findIndex(s => s.id === id);
    const deletedStudent = students.splice(studentIndex, 1)[0];
    
    res.json({ message: 'Aluno excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar todos os treinos (PROTEGIDA)
app.get('/api/workouts', authenticateToken, (req, res) => {
  try {
    // Filtrar treinos apenas do personal logado
    const personalId = req.user.id;
    const personalWorkouts = workouts.filter(workout => workout.personalId === personalId);
    
    // Enriquecer dados com informações do aluno
    const enrichedWorkouts = personalWorkouts.map(workout => {
      const student = students.find(s => s.id === workout.studentId);
      return {
        ...workout,
        studentName: student ? student.name : 'Aluno não encontrado',
        studentAccessCode: student ? student.accessCode : 'N/A'
      };
    });
    
    res.json({ workouts: enrichedWorkouts });
  } catch (error) {
    console.error('Erro ao listar treinos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para criar novo treino (PROTEGIDA)
app.post('/api/workouts', authenticateToken, (req, res) => {
  try {
    const { name, description, studentId, exercises, created_at } = req.body;
    
    // Validações básicas
    if (!name || !description || !studentId || !exercises || exercises.length === 0) {
      return res.status(400).json({ 
        error: 'Nome, descrição, aluno e exercícios são obrigatórios' 
      });
    }
    
    // Verificar se o aluno pertence ao personal logado
    const personalId = req.user.id;
    const student = students.find(s => s.id === studentId && s.personalId === personalId);
    
    if (!student) {
      return res.status(400).json({ 
        error: 'Aluno não encontrado ou não autorizado' 
      });
    }
    
    // Criar novo treino
    const newWorkout = {
      id: Date.now().toString(),
      personalId, // Vincular ao personal logado
      studentId,
      name,
      description,
      exercises,
      created_at: created_at || new Date().toISOString().split('T')[0]
    };
    
    // Adicionar à lista
    workouts.push(newWorkout);
    
    res.status(201).json({ 
      message: 'Treino criado com sucesso',
      workout: newWorkout
    });
  } catch (error) {
    console.error('Erro ao criar treino:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para excluir treino (PROTEGIDA)
app.delete('/api/workouts/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o treino pertence ao personal logado
    const personalId = req.user.id;
    const workout = workouts.find(w => w.id === id && w.personalId === personalId);
    
    if (!workout) {
      return res.status(404).json({ error: 'Treino não encontrado ou não autorizado' });
    }
    
    // Encontrar e remover o treino da lista
    const workoutIndex = workouts.findIndex(w => w.id === id);
    const deletedWorkout = workouts.splice(workoutIndex, 1)[0];
    
    res.json({ message: 'Treino excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir treino:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para treinos de alunos (pública - sem autenticação)
app.get('/api/student-workouts/:accessCode', (req, res) => {
  try {
    const { accessCode } = req.params;
    
    // Encontrar o aluno pelo código de acesso
    const student = students.find(s => s.accessCode === accessCode);
    
    if (!student) {
      return res.status(404).json({ error: 'Código de acesso inválido' });
    }
    
    // Buscar treinos do aluno
    const studentWorkouts = workouts.filter(w => w.studentId === student.id);
    
    if (studentWorkouts.length === 0) {
      return res.json({
        studentName: student.name,
        workouts: [],
        message: 'Nenhum treino encontrado para este aluno'
      });
    }
    
    res.json({
      studentName: student.name,
      workouts: studentWorkouts
    });
  } catch (error) {
    console.error('Erro ao buscar treinos do aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para verificar se o backend está pronto
function isBackendReady() {
  return new Promise((resolve) => {
    const testUrl = `http://localhost:${PORT}/api/test`;
    const req = http.get(testUrl, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Aguardar backend estar pronto antes de servir frontend
async function waitForBackend() {
  console.log('🔄 Aguardando backend estar pronto...');
  
  let attempts = 0;
  const maxAttempts = 30; // 30 segundos
  
  while (attempts < maxAttempts) {
    if (await isBackendReady()) {
      console.log('✅ Backend está pronto! Servindo frontend...');
      return true;
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.stdout.write('.');
  }
  
  console.log('\n❌ Timeout: Backend não respondeu em 30 segundos');
  return false;
}

// Servir arquivos estáticos do React (para produção)
app.use(express.static(path.join(__dirname, 'client/build')));

// Rota catch-all para SPA
app.get('*', async (req, res) => {
  // Verificar se é uma rota da API
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Rota da API não encontrada' });
  }
  
  // Verificar se o backend está pronto antes de servir o frontend
  if (!(await isBackendReady())) {
    return res.status(503).json({ 
      error: 'Serviço temporariamente indisponível',
      message: 'Backend ainda não está pronto. Tente novamente em alguns segundos.'
    });
  }
  
  // Servir o frontend
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Inicializar servidor
const server = app.listen(PORT, async () => {
  console.log(`🚀 Servidor iniciado na porta ${PORT}`);
  console.log(`🔧 Backend: http://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  
  // Aguardar backend estar pronto
  const backendReady = await waitForBackend();
  
  if (backendReady) {
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`✅ Sistema totalmente operacional!`);
  } else {
    console.log(`⚠️  Frontend pode não funcionar corretamente`);
  }
});

// Tratamento de erros do servidor
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Erro: Porta ${PORT} já está em uso`);
    console.error('💡 Solução: Pare outros processos ou mude a porta');
  } else {
    console.error('❌ Erro ao iniciar servidor:', error);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Recebido SIGTERM, encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado graciosamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 Recebido SIGINT, encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado graciosamente');
    process.exit(0);
  });
});

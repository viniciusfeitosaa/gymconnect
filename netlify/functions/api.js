const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// Middleware de autenticação JWT
const authenticateToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    return user;
  } catch (err) {
    return null;
  }
};

// Função principal do Netlify Function
exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Responder a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { path, httpMethod, body, headers: requestHeaders } = event;
    
    // Log da requisição
    console.log(`${new Date().toISOString()} - ${httpMethod} ${path}`, {
      body: body ? JSON.parse(body) : null,
      authorization: requestHeaders.authorization ? 'Bearer ***' : undefined
    });

    // Extrair o caminho da URL
    const urlPath = path.replace('/.netlify/functions/api', '');
    
    // Rota de teste para health check
    if (urlPath === '/test' && httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Backend funcionando no Netlify!',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'production'
        })
      };
    }

    // Rota para health check detalhado
    if (urlPath === '/health' && httpMethod === 'GET') {
      const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        version: '1.0.0'
      };
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(health)
      };
    }

    // Rota para registro de novos personais
    if (urlPath === '/auth/register' && httpMethod === 'POST') {
      const { name, email, password } = JSON.parse(body);
      
      // Validações básicas
      if (!name || !email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Nome, email e senha são obrigatórios' 
          })
        };
      }
      
      // Verificar se o email já existe
      const existingPersonal = personals.find(p => p.email === email);
      if (existingPersonal) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Email já cadastrado' 
          })
        };
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
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ 
          message: 'Personal registrado com sucesso',
          personal: {
            id: newPersonal.id,
            name: newPersonal.name,
            email: newPersonal.email,
            createdAt: newPersonal.createdAt
          }
        })
      };
    }

    // Rota para login de personais
    if (urlPath === '/auth/login' && httpMethod === 'POST') {
      const { email, password } = JSON.parse(body);
      
      // Encontrar o personal pelo email
      const personal = personals.find(p => p.email === email);
      
      if (!personal) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Email não encontrado' })
        };
      }
      
      // Verificar senha com bcrypt
      const isValidPassword = await bcrypt.compare(password, personal.password);
      
      if (!isValidPassword) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Senha incorreta' })
        };
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
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          user: {
            id: personal.id,
            name: personal.name,
            email: personal.email
          },
          token: token
        })
      };
    }

    // Rota para estatísticas do dashboard (PROTEGIDA)
    if (urlPath === '/dashboard/stats' && httpMethod === 'GET') {
      const token = requestHeaders.authorization?.split(' ')[1];
      const user = authenticateToken(token);
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Token de acesso necessário' })
        };
      }

      // Filtrar apenas alunos do personal logado
      const personalId = user.id;
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
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(emptyStats)
        };
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
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(dashboardStats)
      };
    }

    // Rota para listar todos os alunos (PROTEGIDA)
    if (urlPath === '/students' && httpMethod === 'GET') {
      const token = requestHeaders.authorization?.split(' ')[1];
      const user = authenticateToken(token);
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Token de acesso necessário' })
        };
      }

      // Filtrar alunos apenas do personal logado
      const personalId = user.id;
      const personalStudents = students.filter(student => student.personalId === personalId);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ students: personalStudents })
      };
    }

    // Rota para criar novo aluno (PROTEGIDA)
    if (urlPath === '/students' && httpMethod === 'POST') {
      const token = requestHeaders.authorization?.split(' ')[1];
      const user = authenticateToken(token);
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Token de acesso necessário' })
        };
      }

      const { name, accessCode, notes, joinDate, status } = JSON.parse(body);
      
      // Validações básicas
      if (!name || !accessCode) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Nome e código de acesso são obrigatórios' 
          })
        };
      }
      
      // Usar o ID do personal logado (do token)
      const personalId = user.id;
      
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
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ 
          message: 'Aluno criado com sucesso',
          student: newStudent
        })
      };
    }

    // Rota para excluir aluno (PROTEGIDA)
    if (urlPath.startsWith('/students/') && httpMethod === 'DELETE') {
      const token = requestHeaders.authorization?.split(' ')[1];
      const user = authenticateToken(token);
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Token de acesso necessário' })
        };
      }

      const id = urlPath.split('/')[2];
      
      // Verificar se o aluno pertence ao personal logado
      const personalId = user.id;
      const student = students.find(s => s.id === id && s.personalId === personalId);
      
      if (!student) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Aluno não encontrado ou não autorizado' })
        };
      }
      
      // Encontrar e remover o aluno da lista
      const studentIndex = students.findIndex(s => s.id === id);
      const deletedStudent = students.splice(studentIndex, 1)[0];
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Aluno excluído com sucesso' })
      };
    }

    // Rota para listar todos os treinos (PROTEGIDA)
    if (urlPath === '/workouts' && httpMethod === 'GET') {
      const token = requestHeaders.authorization?.split(' ')[1];
      const user = authenticateToken(token);
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Token de acesso necessário' })
        };
      }

      // Filtrar treinos apenas do personal logado
      const personalId = user.id;
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
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ workouts: enrichedWorkouts })
      };
    }

    // Rota para criar novo treino (PROTEGIDA)
    if (urlPath === '/workouts' && httpMethod === 'POST') {
      const token = requestHeaders.authorization?.split(' ')[1];
      const user = authenticateToken(token);
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Token de acesso necessário' })
        };
      }

      const { name, description, studentId, exercises, created_at } = JSON.parse(body);
      
      // Validações básicas
      if (!name || !description || !studentId || !exercises || exercises.length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Nome, descrição, aluno e exercícios são obrigatórios' 
          })
        };
      }
      
      // Verificar se o aluno pertence ao personal logado
      const personalId = user.id;
      const student = students.find(s => s.id === studentId && s.personalId === personalId);
      
      if (!student) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Aluno não encontrado ou não autorizado' 
          })
        };
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
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ 
          message: 'Treino criado com sucesso',
          workout: newWorkout
        })
      };
    }

    // Rota para excluir treino (PROTEGIDA)
    if (urlPath.startsWith('/workouts/') && httpMethod === 'DELETE') {
      const token = requestHeaders.authorization?.split(' ')[1];
      const user = authenticateToken(token);
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Token de acesso necessário' })
        };
      }

      const id = urlPath.split('/')[2];
      
      // Verificar se o treino pertence ao personal logado
      const personalId = user.id;
      const workout = workouts.find(w => w.id === id && w.personalId === personalId);
      
      if (!workout) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Treino não encontrado ou não autorizado' })
        };
      }
      
      // Encontrar e remover o treino da lista
      const workoutIndex = workouts.findIndex(w => w.id === id);
      const deletedWorkout = workouts.splice(workoutIndex, 1)[0];
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Treino excluído com sucesso' })
      };
    }

    // Rota para treinos de alunos (pública - sem autenticação)
    if (urlPath.startsWith('/student-workouts/') && httpMethod === 'GET') {
      const accessCode = urlPath.split('/')[2];
      
      // Encontrar o aluno pelo código de acesso
      const student = students.find(s => s.accessCode === accessCode);
      
      if (!student) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Código de acesso inválido' })
        };
      }
      
      // Buscar treinos do aluno
      const studentWorkouts = workouts.filter(w => w.studentId === student.id);
      
      if (studentWorkouts.length === 0) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            studentName: student.name,
            workouts: [],
            message: 'Nenhum treino encontrado para este aluno'
          })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          studentName: student.name,
          workouts: studentWorkouts
        })
      };
    }

    // Rota não encontrada
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Rota não encontrada' })
    };

  } catch (error) {
    console.error('Erro na API:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro interno do servidor',
        message: error.message
      })
    };
  }
};

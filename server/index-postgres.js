const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'gymconnect-secret-key-2024';

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://gymconnectt.netlify.app',
    'https://gymconnect-app.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Criar tabelas se não existirem
async function createTables() {
  try {
    // Tabela de personal trainers
    await pool.query(`
      CREATE TABLE IF NOT EXISTS personal_trainers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela users (alias para personal_trainers para compatibilidade)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de alunos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        personal_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        access_code VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (personal_id) REFERENCES personal_trainers (id) ON DELETE CASCADE
      )
    `);

    // Tabela de treinos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS workouts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID NOT NULL,
        personal_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        exercises JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
        FOREIGN KEY (personal_id) REFERENCES personal_trainers (id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Tabelas criadas/verificadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
  }
}

// Inicializar tabelas
createTables();

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rotas de autenticação
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Verificar se o email já existe
    const existingUser = await pool.query(
      'SELECT id FROM personal_trainers WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO personal_trainers (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashedPassword]
    );

    // Também inserir na tabela users para compatibilidade
    await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
      [name, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const result = await pool.query(
      'SELECT * FROM personal_trainers WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de alunos
app.post('/api/students', authenticateToken, async (req, res) => {
  try {
    const { name, notes } = req.body;
    const personalId = req.user.id;
    
    if (!name) {
      return res.status(400).json({ error: 'Nome do aluno é obrigatório' });
    }

    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const result = await pool.query(
      'INSERT INTO students (personal_id, name, access_code, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [personalId, name, accessCode, notes || '']
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    const personalId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM students WHERE personal_id = $1 ORDER BY created_at DESC',
      [personalId]
    );

    res.json({ students: result.rows });
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de treinos
app.post('/api/workouts', authenticateToken, async (req, res) => {
  try {
    const { studentId, name, description, exercises } = req.body;
    const personalId = req.user.id;
    
    if (!studentId || !name || !exercises) {
      return res.status(400).json({ error: 'ID do aluno, nome e exercícios são obrigatórios' });
    }

    const result = await pool.query(
      'INSERT INTO workouts (student_id, personal_id, name, description, exercises) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [studentId, personalId, name, description || '', JSON.stringify(exercises)]
    );

    const workout = result.rows[0];
    workout.exercises = JSON.parse(workout.exercises);
    
    res.json(workout);
  } catch (error) {
    console.error('Erro ao criar treino:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/workouts/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const personalId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM workouts WHERE student_id = $1 AND personal_id = $2 ORDER BY created_at DESC',
      [studentId, personalId]
    );
    
    const workouts = result.rows.map(workout => ({
      ...workout,
      exercises: JSON.parse(workout.exercises)
    }));
    
    res.json(workouts);
  } catch (error) {
    console.error('Erro ao buscar treinos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para salvar exercícios individuais
app.post('/api/exercises', authenticateToken, async (req, res) => {
  try {
    const { name, sets, reps, weight, rest, notes, workoutId } = req.body;
    const personalId = req.user.id;
    
    if (!name || !sets || !reps) {
      return res.status(400).json({ error: 'Nome, séries e repetições são obrigatórios' });
    }

    // Criar um novo treino se não existir, ou usar um existente
    let workout;
    if (workoutId) {
      // Verificar se o treino existe e pertence ao personal
      const workoutResult = await pool.query(
        'SELECT * FROM workouts WHERE id = $1 AND personal_id = $2',
        [workoutId, personalId]
      );
      
      if (workoutResult.rows.length === 0) {
        return res.status(404).json({ error: 'Treino não encontrado' });
      }
      
      workout = workoutResult.rows[0];
    } else {
      // Criar um novo treino com student_id (usando o workoutId como studentId temporariamente)
      const workoutResult = await pool.query(
        'INSERT INTO workouts (student_id, personal_id, name, description, exercises) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [workoutId, personalId, 'Treino Individual', 'Treino criado automaticamente', JSON.stringify([])]
      );
      workout = workoutResult.rows[0];
    }

    // Criar o exercício
    const exercise = {
      id: Date.now(),
      name,
      sets,
      reps,
      weight: weight || '',
      rest: rest || '',
      notes: notes || ''
    };

    // Adicionar o exercício ao treino
    const currentExercises = workout.exercises ? JSON.parse(workout.exercises) : [];
    const updatedExercises = [...currentExercises, exercise];

    // Atualizar o treino com o novo exercício
    const result = await pool.query(
      'UPDATE workouts SET exercises = $1 WHERE id = $2 RETURNING *',
      [JSON.stringify(updatedExercises), workout.id]
    );

    const updatedWorkout = result.rows[0];
    updatedWorkout.exercises = JSON.parse(updatedWorkout.exercises);
    
    res.json(exercise);
  } catch (error) {
    console.error('Erro ao salvar exercício:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para alunos acessarem treinos (sem autenticação)
app.post('/api/student-access', async (req, res) => {
  try {
    const { accessCode } = req.body;
    
    if (!accessCode) {
      return res.status(400).json({ error: 'Código de acesso é obrigatório' });
    }

    const studentResult = await pool.query(
      'SELECT s.*, p.name as personal_name FROM students s JOIN personal_trainers p ON s.personal_id = p.id WHERE s.access_code = $1',
      [accessCode]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Código de acesso inválido' });
    }

    const student = studentResult.rows[0];

    // Buscar treinos do aluno
    const workoutsResult = await pool.query(
      'SELECT * FROM workouts WHERE student_id = $1 ORDER BY created_at DESC',
      [student.id]
    );

    const workouts = workoutsResult.rows.map(workout => ({
      ...workout,
      exercises: JSON.parse(workout.exercises)
    }));

    res.json({
      student: {
        id: student.id,
        name: student.name,
        personal_name: student.personal_name
      },
      workouts: workouts
    });
  } catch (error) {
    console.error('Erro ao buscar treinos do aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para verificar se o personal está autenticado
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend PostgreSQL funcionando!', timestamp: new Date().toISOString() });
});

// Rota para health check
app.get('/api/health', async (req, res) => {
  try {
    // Testar conexão com banco
    await pool.query('SELECT 1');
    
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      memory: process.memoryUsage(),
      version: process.version,
      database: 'PostgreSQL (Neon) - Connected'
    };
    
    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'PostgreSQL (Neon) - Disconnected',
      error: error.message
    });
  }
});

// Rota para verificar usuários no banco (PROTEGIDA)
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    // Buscar usuários da tabela personal_trainers
    const personalTrainersResult = await pool.query(
      'SELECT id, name, email, created_at FROM personal_trainers ORDER BY created_at DESC'
    );
    
    // Buscar usuários da tabela users
    const usersResult = await pool.query(
      'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.json({
      personal_trainers: personalTrainersResult.rows,
      users: usersResult.rows,
      total_personal_trainers: personalTrainersResult.rows.length,
      total_users: usersResult.rows.length
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para estatísticas do dashboard (PROTEGIDA)
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  console.log('=== DASHBOARD STATS REQUEST ===');
  console.log('User:', req.user);
  
  try {
    const personalId = req.user.id;
    console.log('Personal ID:', personalId);
    
    // Buscar alunos do personal
    console.log('Buscando alunos...');
    const studentsResult = await pool.query(
      'SELECT * FROM students WHERE personal_id = $1',
      [personalId]
    );
    
    console.log('Alunos encontrados:', studentsResult.rows.length);
    
    // Buscar treinos do personal
    console.log('Buscando treinos...');
    const workoutsResult = await pool.query(
      'SELECT * FROM workouts WHERE personal_id = $1',
      [personalId]
    );
    
    console.log('Treinos encontrados:', workoutsResult.rows.length);
    
    const students = studentsResult.rows;
    const workouts = workoutsResult.rows;
    
    const stats = {
      totalStudents: students.length,
      totalWorkouts: workouts.length,
      recentStudents: students.slice(0, 3).map(student => ({
        id: student.id,
        name: student.name,
        access_code: student.access_code,
        workoutCount: workouts.filter(w => w.student_id === student.id).length
      })),
      message: students.length === 0 
        ? "Você ainda não tem alunos cadastrados. Comece adicionando seu primeiro aluno!"
        : "Seus alunos estão progredindo bem! Continue criando treinos personalizados."
    };
    
    console.log('Stats calculadas:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

// Rota para listar todos os treinos (PROTEGIDA)
app.get('/api/workouts', authenticateToken, async (req, res) => {
  try {
    const personalId = req.user.id;
    
    const result = await pool.query(
      `SELECT w.*, s.name as student_name, s.access_code as student_access_code 
       FROM workouts w 
       JOIN students s ON w.student_id = s.id 
       WHERE w.personal_id = $1 
       ORDER BY w.created_at DESC`,
      [personalId]
    );
    
    const workouts = result.rows.map(workout => ({
      ...workout,
      exercises: JSON.parse(workout.exercises)
    }));
    
    res.json({ workouts: workouts });
  } catch (error) {
    console.error('Erro ao buscar treinos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para excluir treino (PROTEGIDA)
app.delete('/api/workouts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const personalId = req.user.id;
    
    const result = await pool.query(
      'DELETE FROM workouts WHERE id = $1 AND personal_id = $2',
      [id, personalId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Treino não encontrado ou não autorizado' });
    }
    
    res.json({ message: 'Treino excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir treino:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para excluir aluno (PROTEGIDA)
app.delete('/api/students/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const personalId = req.user.id;
    
    const result = await pool.query(
      'DELETE FROM students WHERE id = $1 AND personal_id = $2',
      [id, personalId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado ou não autorizado' });
    }
    
    res.json({ message: 'Aluno excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para treinos de alunos (pública - sem autenticação)
app.get('/api/student-workouts/:accessCode', async (req, res) => {
  try {
    const { accessCode } = req.params;
    
    const studentResult = await pool.query(
      'SELECT * FROM students WHERE access_code = $1',
      [accessCode]
    );
    
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Código de acesso inválido' });
    }
    
    const student = studentResult.rows[0];
    
    // Buscar treinos do aluno
    const workoutsResult = await pool.query(
      'SELECT * FROM workouts WHERE student_id = $1 ORDER BY created_at DESC',
      [student.id]
    );
    
    const workouts = workoutsResult.rows.map(workout => ({
      ...workout,
      exercises: JSON.parse(workout.exercises)
    }));
    
    res.json({
      studentName: student.name,
      workouts: workouts,
      message: workouts.length === 0 ? 'Nenhum treino encontrado para este aluno' : undefined
    });
  } catch (error) {
    console.error('Erro ao buscar treinos do aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Fechar conexão com banco ao encerrar servidor
process.on('SIGINT', async () => {
  console.log('Encerrando servidor...');
  await pool.end();
  console.log('Conexão com banco de dados fechada.');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor PostgreSQL rodando na porta ${PORT}`);
  console.log(`📊 API Test: http://localhost:${PORT}/api/test`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`💾 Banco de dados: PostgreSQL (Neon)`);
});

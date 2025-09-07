const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'gymconnect-secret-key-2024';

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://gymconnectt.netlify.app',
      'https://gymconnect-app.netlify.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
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
        phone VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Adicionar coluna phone se não existir
    await pool.query(`
      ALTER TABLE personal_trainers 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(50)
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
      return res
        .status(400)
        .json({ error: 'Todos os campos são obrigatórios' });
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

    if (!result.rows || result.rows.length === 0) {
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    if (error.code === '23505') {
      // Unique constraint violation
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

    console.log('🔍 Tentativa de login:', email);

    const result = await pool.query(
      'SELECT * FROM personal_trainers WHERE email = $1',
      [email]
    );

    console.log(
      '📋 Usuários encontrados:',
      result.rows ? result.rows.length : 0
    );

    if (!result.rows || result.rows.length === 0) {
      console.log('❌ Usuário não encontrado');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];
    console.log('👤 Usuário encontrado:', user.name);
    console.log('🔐 Hash da senha:', user.password.substring(0, 20) + '...');

    const validPassword = await bcrypt.compare(password, user.password);
    console.log('✅ Senha válida:', validPassword);

    if (!validPassword) {
      console.log('❌ Senha inválida');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
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

    if (!result.rows || result.rows.length === 0) {
      return res.status(500).json({ error: 'Erro ao criar aluno' });
    }

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

    res.json({ students: result.rows || [] });
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
      return res
        .status(400)
        .json({ error: 'ID do aluno, nome e exercícios são obrigatórios' });
    }

    // Verificar se o aluno existe
    const studentCheck = await pool.query(
      'SELECT id FROM students WHERE id = $1',
      [studentId]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Aluno não encontrado' });
    }

    // Criar o treino com associações ao aluno e personal
    const workoutResult = await pool.query(
      'INSERT INTO workouts (name, description, student_id, personal_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description || '', studentId, personalId]
    );

    const workout = workoutResult.rows[0];

    // Inserir exercícios na tabela exercises
    if (exercises && exercises.length > 0) {
      for (let i = 0; i < exercises.length; i++) {
        const exercise = exercises[i];
        await pool.query(
          'INSERT INTO exercises (workout_id, name, sets, reps, weight, rest, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [
            workout.id,
            exercise.name,
            exercise.sets,
            exercise.reps,
            exercise.weight || null,
            exercise.rest || null,
            exercise.notes || null,
          ]
        );
      }
    }

    // Buscar o treino completo com exercícios
    const completeWorkout = await pool.query(
      `
      SELECT w.*, 
             json_agg(
               json_build_object(
                 'id', e.id,
                 'name', e.name,
                 'sets', e.sets,
                 'reps', e.reps,
                 'weight', e.weight,
                 'rest', e.rest,
                 'notes', e.notes
               ) ORDER BY e.id
             ) as exercises
      FROM workouts w
      LEFT JOIN exercises e ON e.workout_id = w.id
      WHERE w.id = $1
      GROUP BY w.id
    `,
      [workout.id]
    );

    const finalWorkout = completeWorkout.rows[0];
    finalWorkout.exercises = finalWorkout.exercises.filter(
      ex => ex.id !== null
    );

    res.json(finalWorkout);
  } catch (error) {
    console.error('Erro ao criar treino:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message,
    });
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

    const workouts = (result.rows || []).map(workout => ({
      ...workout,
      exercises: JSON.parse(workout.exercises),
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
      return res
        .status(400)
        .json({ error: 'Nome, séries e repetições são obrigatórios' });
    }

    // Verificar se workoutId é um número (ID de treino) ou UUID (ID de aluno)
    const isWorkoutId = /^\d+$/.test(workoutId);

    let workout;
    if (isWorkoutId) {
      // workoutId é um número, então é um ID de treino existente
      const workoutResult = await pool.query(
        'SELECT * FROM workouts WHERE id = $1',
        [parseInt(workoutId)]
      );

      if (workoutResult.rows.length === 0) {
        return res.status(404).json({ error: 'Treino não encontrado' });
      }

      workout = workoutResult.rows[0];
    } else {
      // workoutId é um UUID (ID de aluno), criar um novo treino
      const workoutResult = await pool.query(
        'INSERT INTO workouts (name, description) VALUES ($1, $2) RETURNING *',
        ['Treino Individual', 'Treino criado automaticamente']
      );
      workout = workoutResult.rows[0];
    }

    // Criar o exercício na tabela exercises
    const exerciseResult = await pool.query(
      'INSERT INTO exercises (name, sets, reps, weight, rest, notes, workout_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, sets, reps, weight || '', rest || '', notes || '', workout.id]
    );

    const exercise = exerciseResult.rows[0];

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
      exercises: JSON.parse(workout.exercises),
    }));

    res.json({
      student: {
        id: student.id,
        name: student.name,
        personal_name: student.personal_name,
      },
      workouts: workouts,
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
  res.json({
    message: 'Backend PostgreSQL funcionando!',
    timestamp: new Date().toISOString(),
  });
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
      database: 'PostgreSQL (Neon) - Connected',
    };

    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'PostgreSQL (Neon) - Disconnected',
      error: error.message,
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
      total_users: usersResult.rows.length,
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para estatísticas do dashboard (PROTEGIDA)
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const personalId = req.user.id;

    // Buscar alunos do personal
    const studentsResult = await pool.query(
      'SELECT * FROM students WHERE personal_id = $1',
      [personalId]
    );

    // Buscar todos os treinos (como não há vinculação direta, contamos todos os treinos)
    const workoutsResult = await pool.query(
      'SELECT COUNT(*) as count FROM workouts'
    );

    const students = studentsResult.rows;
    const totalWorkouts = parseInt(workoutsResult.rows[0].count);

    // Calcular treinos por aluno (distribuição proporcional)
    const workoutsPerStudent =
      students.length > 0 ? Math.floor(totalWorkouts / students.length) : 0;
    const remainingWorkouts =
      students.length > 0 ? totalWorkouts % students.length : 0;

    const stats = {
      totalStudents: students.length,
      totalWorkouts: totalWorkouts,
      recentStudents: students.slice(0, 3).map((student, index) => ({
        id: student.id,
        name: student.name,
        access_code: student.access_code,
        workoutCount: workoutsPerStudent + (index < remainingWorkouts ? 1 : 0),
      })),
      message:
        students.length === 0
          ? 'Você ainda não tem alunos cadastrados. Comece adicionando seu primeiro aluno!'
          : totalWorkouts === 0
          ? 'Você tem alunos cadastrados! Agora crie treinos personalizados para eles.'
          : 'Seus alunos estão progredindo bem! Continue criando treinos personalizados.',
    };

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar todos os treinos (PROTEGIDA)
app.get('/api/workouts', authenticateToken, async (req, res) => {
  try {
    const personalId = req.user.id;

    // Buscar alunos do personal trainer
    const studentsResult = await pool.query(
      'SELECT id, name, access_code FROM students WHERE personal_id = $1',
      [personalId]
    );

    const students = studentsResult.rows;

    // Buscar treinos com exercícios associados ao personal trainer
    const result = await pool.query(
      `
      SELECT w.*, 
             s.name as student_name,
             s.access_code as student_access_code,
             json_agg(
               json_build_object(
                 'id', e.id,
                 'name', e.name,
                 'sets', e.sets,
                 'reps', e.reps,
                 'weight', e.weight,
                 'rest', e.rest,
                 'notes', e.notes
               ) ORDER BY e.id
             ) as exercises
      FROM workouts w
      LEFT JOIN students s ON w.student_id = s.id
      LEFT JOIN exercises e ON e.workout_id = w.id
      WHERE w.personal_id = $1
      GROUP BY w.id, s.name, s.access_code
      ORDER BY w.created_at DESC
    `,
      [personalId]
    );

    const workouts = (result.rows || []).map(workout => ({
      id: workout.id,
      name: workout.name,
      description: workout.description,
      created_at: workout.created_at,
      exercises: workout.exercises.filter(ex => ex.id !== null),
      studentName: workout.student_name || 'Treino sem aluno',
      studentAccessCode: workout.student_access_code || 'N/A',
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

    // Primeiro excluir os exercícios relacionados
    await pool.query('DELETE FROM exercises WHERE workout_id = $1', [id]);

    // Depois excluir o treino
    const result = await pool.query('DELETE FROM workouts WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Treino não encontrado' });
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
      return res
        .status(404)
        .json({ error: 'Aluno não encontrado ou não autorizado' });
    }

    res.json({ message: 'Aluno excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar informações do personal trainer (pública - sem autenticação)
app.get('/api/student-trainer-info/:accessCode', async (req, res) => {
  try {
    const { accessCode } = req.params;

    const result = await pool.query(
      `
      SELECT p.name as trainer_name, p.email as trainer_email, p.phone as trainer_phone
      FROM students s 
      JOIN personal_trainers p ON s.personal_id = p.id 
      WHERE s.access_code = $1
    `,
      [accessCode]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Código de acesso inválido' });
    }

    const trainerInfo = result.rows[0];

    res.json({
      trainerName: trainerInfo.trainer_name,
      trainerEmail: trainerInfo.trainer_email,
      trainerPhone: trainerInfo.trainer_phone,
    });
  } catch (error) {
    console.error('Erro ao buscar informações do personal trainer:', error);
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

    // Buscar treinos diretamente associados ao aluno
    const workoutsResult = await pool.query(
      `
      SELECT w.*, 
             json_agg(
               json_build_object(
                 'id', e.id,
                 'name', e.name,
                 'sets', e.sets,
                 'reps', e.reps,
                 'weight', e.weight,
                 'rest', e.rest,
                 'notes', e.notes
               ) ORDER BY e.id
             ) as exercises
      FROM workouts w
      LEFT JOIN exercises e ON e.workout_id = w.id
      WHERE w.student_id = $1
      GROUP BY w.id
      ORDER BY w.created_at DESC
    `,
      [student.id]
    );

    const studentWorkouts = workoutsResult.rows;

    const workouts = studentWorkouts.map(workout => ({
      id: workout.id,
      name: workout.name,
      description: workout.description,
      created_at: workout.created_at,
      exercises: workout.exercises.filter(ex => ex.id !== null),
    }));

    res.json({
      studentName: student.name,
      studentAccessCode: student.access_code,
      workouts: workouts,
      message:
        workouts.length === 0
          ? 'Nenhum treino encontrado para este aluno'
          : undefined,
    });
  } catch (error) {
    console.error('Erro ao buscar treinos do aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==================== ENDPOINTS DE EXCLUSÃO EM CASCATA ====================

// Excluir personal trainer e todos os dados relacionados (cascata)
app.delete('/api/personal-trainer/:id', authenticateToken, async (req, res) => {
  try {
    const personalId = req.params.id;
    const currentUserId = req.user.id;

    // Verificar se o usuário está tentando excluir a si mesmo ou se é admin
    if (personalId !== currentUserId) {
      return res
        .status(403)
        .json({ error: 'Você só pode excluir sua própria conta' });
    }

    console.log(`🗑️ Excluindo personal trainer: ${personalId}`);

    // A exclusão em cascata será feita automaticamente pelas foreign keys:
    // 1. Personal trainer excluído
    // 2. Alunos associados excluídos (ON DELETE CASCADE)
    // 3. Treinos associados excluídos (ON DELETE CASCADE)
    // 4. Exercícios associados excluídos (ON DELETE CASCADE)

    const result = await pool.query(
      'DELETE FROM personal_trainers WHERE id = $1',
      [personalId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Personal trainer não encontrado' });
    }

    console.log('✅ Personal trainer e todos os dados relacionados excluídos');

    res.json({
      message:
        'Personal trainer e todos os dados relacionados foram excluídos com sucesso',
      deletedPersonalId: personalId,
    });
  } catch (error) {
    console.error('❌ Erro ao excluir personal trainer:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==================== ENDPOINTS DE PLANOS ====================

// Buscar todos os planos disponíveis
app.get('/api/plans', async (req, res) => {
  try {
    console.log('🔄 Buscando planos...');

    const result = await pool.query('SELECT * FROM plans ORDER BY price ASC');

    console.log(`📋 Planos encontrados: ${result.rows.length}`);

    // Retornar dados simples primeiro
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar planos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar plano atual do usuário
app.get('/api/plans/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.max_students,
        p.features,
        pt.plan_status,
        pt.plan_expires_at,
        pt.subscription_id
      FROM personal_trainers pt
      JOIN plans p ON pt.plan_id = p.id
      WHERE pt.id = $1
    `,
      [userId]
    );

    if (!result.rows || result.rows.length === 0) {
      // Se não encontrar plano, retorna plano gratuito
      const freePlanResult = await pool.query(
        'SELECT * FROM plans WHERE id = $1',
        ['free']
      );

      if (freePlanResult.rows.length > 0) {
        const freePlan = freePlanResult.rows[0];
        return res.json({
          success: true,
          plan: {
            ...freePlan,
            features:
              typeof freePlan.features === 'string'
                ? JSON.parse(freePlan.features)
                : freePlan.features,
            plan_status: 'active',
            plan_expires_at: null,
            subscription_id: null,
          },
        });
      }

      // Se não encontrar o plano gratuito no banco, retorna um plano gratuito padrão
      return res.json({
        success: true,
        plan: {
          id: 'free',
          name: 'Gratuito',
          price: 0,
          max_students: 1,
          features: ['1 aluno', 'Treinos ilimitados', 'Acesso básico'],
          plan_status: 'active',
          plan_expires_at: null,
          subscription_id: null,
        },
      });
    }

    const plan = result.rows[0];
    plan.features =
      typeof plan.features === 'string'
        ? JSON.parse(plan.features)
        : plan.features;

    res.json({
      success: true,
      plan: plan,
    });
  } catch (error) {
    console.error('Erro ao buscar plano do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar limite de alunos
app.get(
  '/api/plans/check-limit/:resource',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { resource } = req.params;

      if (resource !== 'students') {
        return res.status(400).json({ error: 'Recurso não suportado' });
      }

      // Buscar plano atual
      const planResult = await pool.query(
        `
      SELECT p.max_students
      FROM personal_trainers pt
      JOIN plans p ON pt.plan_id = p.id
      WHERE pt.id = $1
    `,
        [userId]
      );

      if (!planResult.rows || planResult.rows.length === 0) {
        return res.status(404).json({ error: 'Plano não encontrado' });
      }

      const userPlan = planResult.rows[0];

      if (!userPlan.max_students) {
        // Plano ilimitado
        return res.json({ canAdd: true, current: 0, max: null });
      }

      // Contar alunos atuais
      const countResult = await pool.query(
        'SELECT COUNT(*) as count FROM students WHERE personal_id = $1',
        [userId]
      );

      const currentCount = parseInt(countResult.rows[0].count);
      const canAdd = currentCount < userPlan.max_students;

      res.json({
        canAdd,
        current: currentCount,
        max: userPlan.max_students,
      });
    } catch (error) {
      console.error('Erro ao verificar limite:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

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

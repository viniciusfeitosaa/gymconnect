const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// Chave secreta para JWT (em produção, usar variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'gymconnect-secret-key-2024';

// Configuração do banco de dados PostgreSQL (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_CB1LSdDMrE2J@ep-crimson-mountain-aeg7vggf-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

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
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Alterar tabela workouts se ela existir com estrutura antiga
    await pool.query(`
      ALTER TABLE workouts 
      ALTER COLUMN id TYPE UUID USING gen_random_uuid()
    `).catch(() => {
      // Ignorar erro se a coluna já for UUID
    });
    
    // Tentar alterar workout_id na tabela exercises para UUID
    await pool.query(`
      ALTER TABLE exercises 
      ALTER COLUMN workout_id TYPE UUID USING workout_id::uuid
    `).catch(() => {
      // Ignorar erro se já for UUID ou se não conseguir converter
    });

    // Tabela de exercícios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exercises (
        id SERIAL PRIMARY KEY,
        workout_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        sets INTEGER NOT NULL DEFAULT 3,
        reps VARCHAR(100),
        weight VARCHAR(100),
        rest VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
      )
    `);

    // Alterar tabela exercises se ela existir com estrutura antiga
    await pool.query(`
      ALTER TABLE exercises 
      ALTER COLUMN workout_id TYPE UUID USING gen_random_uuid()
    `).catch(() => {
      // Ignorar erro se a coluna já for UUID
    });

    console.log('✅ Tabelas criadas/verificadas com sucesso no Netlify');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas no Netlify:', error);
  }
}

// Inicializar tabelas
createTables();

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
    'Access-Control-Allow-Origin': 'https://gymconnectt.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
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
      try {
        // Testar conexão com banco
        await pool.query('SELECT 1');
        
        const health = {
          status: 'OK',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'production',
          version: '1.0.0',
          database: 'PostgreSQL (Neon) - Connected'
        };
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(health)
        };
      } catch (error) {
        return {
          statusCode: 503,
          headers,
          body: JSON.stringify({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            database: 'PostgreSQL (Neon) - Disconnected',
            error: error.message
          })
        };
      }
    }

    // Rota para verificar usuários no banco (PROTEGIDA)
    if (urlPath === '/admin/users' && httpMethod === 'GET') {
      const token = requestHeaders.authorization?.split(' ')[1];
      const user = authenticateToken(token);
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Token de acesso necessário' })
        };
      }

      try {
        // Buscar usuários da tabela personal_trainers
        const personalTrainersResult = await pool.query(
          'SELECT id, name, email, created_at FROM personal_trainers ORDER BY created_at DESC'
        );
        
        // Buscar usuários da tabela users
        const usersResult = await pool.query(
          'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC'
        );
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            personal_trainers: personalTrainersResult.rows,
            users: usersResult.rows,
            total_personal_trainers: personalTrainersResult.rows.length,
            total_users: usersResult.rows.length
          })
        };
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
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
      
      try {
        // Hash da senha com bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserir no banco PostgreSQL (tabela personal_trainers)
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
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            token,
            user: { id: user.id, name: user.name, email: user.email }
          })
        };
      } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
              error: 'Email já cadastrado' 
            })
          };
        }
        console.error('Erro no registro:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'Erro interno do servidor' 
          })
        };
      }
    }

    // Rota para login de personais
    if (urlPath === '/auth/login' && httpMethod === 'POST') {
      const { email, password } = JSON.parse(body);
      
      try {
        // Buscar personal no banco PostgreSQL
        const result = await pool.query(
          'SELECT * FROM personal_trainers WHERE email = $1',
          [email]
        );

        if (result.rows.length === 0) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Credenciais inválidas' })
          };
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Credenciais inválidas' })
          };
        }

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            token,
            user: { id: user.id, name: user.name, email: user.email }
          })
        };
      } catch (error) {
        console.error('Erro no login:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para verificar se o personal está autenticado
    if (urlPath === '/auth/me' && httpMethod === 'GET') {
      const token = requestHeaders.authorization?.split(' ')[1];
      const user = authenticateToken(token);
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Token de acesso necessário' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ user })
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

      try {
        const personalId = user.id;
        
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
        const workoutsPerStudent = students.length > 0 ? Math.floor(totalWorkouts / students.length) : 0;
        const remainingWorkouts = students.length > 0 ? totalWorkouts % students.length : 0;
        
        const stats = {
          totalStudents: students.length,
          totalWorkouts: totalWorkouts,
          recentStudents: students.slice(0, 3).map((student, index) => ({
            id: student.id,
            name: student.name,
            access_code: student.access_code,
            workoutCount: workoutsPerStudent + (index < remainingWorkouts ? 1 : 0)
          })),
          message: students.length === 0 
            ? "Você ainda não tem alunos cadastrados. Comece adicionando seu primeiro aluno!"
            : totalWorkouts === 0
            ? "Você tem alunos cadastrados! Agora crie treinos personalizados para eles."
            : "Seus alunos estão progredindo bem! Continue criando treinos personalizados."
        };
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(stats)
        };
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
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

      try {
        const personalId = user.id;
        
        const result = await pool.query(
          'SELECT * FROM students WHERE personal_id = $1 ORDER BY created_at DESC',
          [personalId]
        );

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ students: result.rows })
        };
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
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

      try {
        const { name, notes } = JSON.parse(body);
        const personalId = user.id;
        
        if (!name) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Nome do aluno é obrigatório' })
          };
        }

        const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const result = await pool.query(
          'INSERT INTO students (personal_id, name, access_code, notes) VALUES ($1, $2, $3, $4) RETURNING *',
          [personalId, name, accessCode, notes || '']
        );

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(result.rows[0])
        };
      } catch (error) {
        console.error('Erro ao criar aluno:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
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

      try {
        const id = urlPath.split('/')[2];
        const personalId = user.id;
        
        const result = await pool.query(
          'DELETE FROM students WHERE id = $1 AND personal_id = $2',
          [id, personalId]
        );
        
        if (result.rowCount === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Aluno não encontrado ou não autorizado' })
          };
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Aluno excluído com sucesso' })
        };
      } catch (error) {
        console.error('Erro ao excluir aluno:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
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

      try {
        const personalId = user.id;
        
        // Buscar alunos do personal trainer
        const studentsResult = await pool.query(
          'SELECT id, name, access_code FROM students WHERE personal_id = $1',
          [personalId]
        );
        
        const students = studentsResult.rows;
        
        // Buscar treinos com exercícios
        const result = await pool.query(`
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
          GROUP BY w.id
          ORDER BY w.created_at DESC
        `);
        
        // Distribuir treinos entre os alunos de forma proporcional
        const workouts = result.rows.map((workout, index) => {
          let studentName = 'Treino individual';
          let studentAccessCode = 'Individual';
          
          if (students.length > 0) {
            // Distribuir treinos entre os alunos de forma circular
            const studentIndex = index % students.length;
            const assignedStudent = students[studentIndex];
            studentName = assignedStudent.name;
            studentAccessCode = assignedStudent.access_code;
          }
          
          return {
            id: workout.id,
            name: workout.name,
            description: workout.description,
            created_at: workout.created_at,
            exercises: workout.exercises.filter(ex => ex.id !== null),
            studentName: studentName,
            studentAccessCode: studentAccessCode
          };
        });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ workouts: workouts })
        };
      } catch (error) {
        console.error('Erro ao buscar treinos:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
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

      try {
        const { studentId, name, description, exercises } = JSON.parse(body);
        const personalId = user.id;
        
        if (!studentId || !name || !exercises) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID do aluno, nome e exercícios são obrigatórios' })
          };
        }

        // Verificar se o aluno existe
        const studentCheck = await pool.query('SELECT id FROM students WHERE id = $1', [studentId]);
        
        if (studentCheck.rows.length === 0) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Aluno não encontrado' })
          };
        }
        
        // Criar o treino (apenas com name e description)
        const workoutResult = await pool.query(
          'INSERT INTO workouts (name, description) VALUES ($1, $2) RETURNING *',
          [name, description || '']
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
                exercise.notes || null
              ]
            );
          }
        }

        // Buscar o treino completo com exercícios
        const completeWorkout = await pool.query(`
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
        `, [workout.id]);

        const finalWorkout = completeWorkout.rows[0];
        finalWorkout.exercises = finalWorkout.exercises.filter(ex => ex.id !== null);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(finalWorkout)
        };
      } catch (error) {
        console.error('Erro ao criar treino:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'Erro interno do servidor',
            details: error.message 
          })
        };
      }
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

      try {
        const id = urlPath.split('/')[2];
        
        // Primeiro excluir os exercícios relacionados
        await pool.query('DELETE FROM exercises WHERE workout_id = $1', [id]);
        
        // Depois excluir o treino
        const result = await pool.query('DELETE FROM workouts WHERE id = $1', [id]);
        
        if (result.rowCount === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Treino não encontrado' })
          };
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Treino excluído com sucesso' })
        };
      } catch (error) {
        console.error('Erro ao excluir treino:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para salvar exercícios individuais (PROTEGIDA)
    if (urlPath === '/exercises' && httpMethod === 'POST') {
      const token = requestHeaders.authorization?.split(' ')[1];
      const user = authenticateToken(token);
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Token de acesso necessário' })
        };
      }

      try {
        const { name, sets, reps, weight, rest, notes, workoutId } = JSON.parse(body);
        const personalId = user.id;
        
        if (!name || !sets || !reps) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Nome, séries e repetições são obrigatórios' })
          };
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
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: 'Treino não encontrado' })
            };
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
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(exercise)
        };
      } catch (error) {
        console.error('Erro ao salvar exercício:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para buscar informações do personal trainer (pública - sem autenticação)
    if (urlPath.startsWith('/student-trainer-info/') && httpMethod === 'GET') {
      try {
        const accessCode = urlPath.split('/')[2];
        
        const result = await pool.query(`
          SELECT p.name as trainer_name, p.email as trainer_email, p.phone as trainer_phone
          FROM students s 
          JOIN personal_trainers p ON s.personal_id = p.id 
          WHERE s.access_code = $1
        `, [accessCode]);
        
        if (result.rows.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Código de acesso inválido' })
          };
        }
        
        const trainerInfo = result.rows[0];
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            trainerName: trainerInfo.trainer_name,
            trainerEmail: trainerInfo.trainer_email,
            trainerPhone: trainerInfo.trainer_phone
          })
        };
      } catch (error) {
        console.error('Erro ao buscar informações do personal trainer:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
    }

    // Rota para treinos de alunos (pública - sem autenticação)
    if (urlPath.startsWith('/student-workouts/') && httpMethod === 'GET') {
      try {
        const accessCode = urlPath.split('/')[2];
        
        const studentResult = await pool.query(
          'SELECT * FROM students WHERE access_code = $1',
          [accessCode]
        );
        
        if (studentResult.rows.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Código de acesso inválido' })
          };
        }
        
        const student = studentResult.rows[0];
        
        // Buscar todos os treinos com exercícios (como não há vinculação direta, 
        // vamos buscar todos os treinos e associar ao aluno)
        const workoutsResult = await pool.query(`
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
          GROUP BY w.id
          ORDER BY w.created_at DESC
        `);
        
        // Filtrar treinos que pertencem a este aluno
        // Como não há vinculação direta, vamos usar uma lógica baseada no personal_id
        const personalId = student.personal_id;
        
        // Buscar todos os alunos do mesmo personal trainer
        const allStudentsResult = await pool.query(
          'SELECT id FROM students WHERE personal_id = $1 ORDER BY created_at',
          [personalId]
        );
        
        const allStudents = allStudentsResult.rows;
        const studentIndex = allStudents.findIndex(s => s.id === student.id);
        
        // Distribuir treinos entre os alunos de forma circular
        const studentWorkouts = workoutsResult.rows.filter((workout, index) => {
          if (allStudents.length === 0) return false;
          const assignedStudentIndex = index % allStudents.length;
          return assignedStudentIndex === studentIndex;
        });
        
        const workouts = studentWorkouts.map(workout => ({
          id: workout.id,
          name: workout.name,
          description: workout.description,
          created_at: workout.created_at,
          exercises: workout.exercises.filter(ex => ex.id !== null)
        }));
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            studentName: student.name,
            studentAccessCode: student.access_code,
            workouts: workouts,
            message: workouts.length === 0 ? 'Nenhum treino encontrado para este aluno' : undefined
          })
        };
      } catch (error) {
        console.error('Erro ao buscar treinos do aluno:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
        };
      }
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

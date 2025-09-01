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
    // Tabela de personal trainers (users)
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
        
        // Buscar treinos do personal
        const workoutsResult = await pool.query(
          'SELECT * FROM workouts WHERE personal_id = $1',
          [personalId]
        );
        
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
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ workouts })
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

        const result = await pool.query(
          'INSERT INTO workouts (student_id, personal_id, name, description, exercises) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [studentId, personalId, name, description || '', JSON.stringify(exercises)]
        );

        const workout = result.rows[0];
        workout.exercises = JSON.parse(workout.exercises);
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(workout)
        };
      } catch (error) {
        console.error('Erro ao criar treino:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erro interno do servidor' })
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
        const personalId = user.id;
        
        const result = await pool.query(
          'DELETE FROM workouts WHERE id = $1 AND personal_id = $2',
          [id, personalId]
        );
        
        if (result.rowCount === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Treino não encontrado ou não autorizado' })
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
        
        // Buscar treinos do aluno
        const workoutsResult = await pool.query(
          'SELECT * FROM workouts WHERE student_id = $1 ORDER BY created_at DESC',
          [student.id]
        );
        
        const workouts = workoutsResult.rows.map(workout => ({
          ...workout,
          exercises: JSON.parse(workout.exercises)
        }));
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            studentName: student.name,
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

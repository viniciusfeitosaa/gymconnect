const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Função principal que roteia as requisições
exports.handler = async (event, context) => {
  // Habilitar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Responder a requisições OPTIONS (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const { path, httpMethod } = event;
  const pathSegments = path.replace('/.netlify/functions/', '').split('/');

  try {
    // Roteamento baseado no path
    if (pathSegments[0] === 'api') {
      const resource = pathSegments[1];
      const id = pathSegments[2];
      const action = pathSegments[3];

      switch (resource) {
        case 'auth':
          return await handleAuth(event, headers);
        case 'users':
          return await handleUsers(event, headers, id);
        case 'students':
          return await handleStudents(event, headers, id, action);
        case 'workouts':
          return await handleWorkouts(event, headers, id, action);
        default:
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Endpoint não encontrado' })
          };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint não encontrado' })
    };

  } catch (error) {
    console.error('Erro na função:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    };
  }
};

// Função para autenticação
async function handleAuth(event, headers) {
  if (event.httpMethod === 'POST') {
    const { email, password } = JSON.parse(event.body);
    
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
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
      
      // Verificar senha com bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (isValidPassword) {
        // Gerar JWT token
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '24h' }
        );
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            user: {
              id: user.id,
              name: user.name,
              email: user.email
            },
            token
          })
        };
      }

      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Credenciais inválidas' })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Método não permitido' })
  };
}

// Função para gerenciar usuários
async function handleUsers(event, headers, id) {
  if (event.httpMethod === 'POST') {
    const { name, email, password } = JSON.parse(event.body);
    
    try {
      // Hash da senha com bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const result = await pool.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name, email, hashedPassword]
      );
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(result.rows[0])
      };
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email já cadastrado' })
        };
      }
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message })
      };
    }
  }

  if (event.httpMethod === 'GET' && !id) {
    try {
      const result = await pool.query('SELECT id, name, email FROM users');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows)
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Método não permitido' })
  };
}

// Função para gerenciar alunos
async function handleStudents(event, headers, id, action) {
  if (event.httpMethod === 'POST' && !id) {
    const { name, accessCode, userId } = JSON.parse(event.body);
    
    try {
      const result = await pool.query(
        'INSERT INTO students (name, access_code, user_id) VALUES ($1, $2, $3) RETURNING *',
        [name, accessCode, userId]
      );
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(result.rows[0])
      };
    } catch (error) {
      if (error.code === '23505') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Código de acesso já existe' })
        };
      }
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message })
      };
    }
  }

  if (event.httpMethod === 'GET') {
    if (id) {
      // Buscar aluno específico
      try {
        const result = await pool.query(
          'SELECT * FROM students WHERE id = $1',
          [id]
        );
        
        if (result.rows.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Aluno não encontrado' })
          };
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result.rows[0])
        };
      } catch (error) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: error.message })
        };
      }
    } else {
      // Listar todos os alunos
      try {
        const result = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result.rows)
        };
      } catch (error) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: error.message })
        };
      }
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Método não permitido' })
  };
}

// Função para gerenciar treinos
async function handleWorkouts(event, headers, id, action) {
  if (event.httpMethod === 'POST' && !id) {
    const { name, description, studentId, exercises } = JSON.parse(event.body);
    
    try {
      // Inserir o treino
      const workoutResult = await pool.query(
        'INSERT INTO workouts (name, description, student_id) VALUES ($1, $2, $3) RETURNING *',
        [name, description, studentId]
      );
      
      const workout = workoutResult.rows[0];
      
      // Inserir os exercícios
      if (exercises && exercises.length > 0) {
        for (const exercise of exercises) {
          await pool.query(
            'INSERT INTO exercises (name, sets, reps, weight, rest, notes, workout_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [exercise.name, exercise.sets, exercise.reps, exercise.weight, exercise.rest, exercise.notes, workout.id]
          );
        }
      }
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(workout)
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message })
      };
    }
  }

  if (event.httpMethod === 'GET') {
    if (id) {
      // Buscar treinos de um aluno específico
      try {
        const workoutsResult = await pool.query(
          'SELECT * FROM workouts WHERE student_id = $1 ORDER BY created_at DESC',
          [id]
        );
        
        const workouts = workoutsResult.rows;
        
        // Para cada treino, buscar os exercícios
        for (let workout of workouts) {
          const exercisesResult = await pool.query(
            'SELECT * FROM exercises WHERE workout_id = $1 ORDER BY created_at',
            [workout.id]
          );
          workout.exercises = exercisesResult.rows;
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(workouts)
        };
      } catch (error) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: error.message })
        };
      }
    } else {
      // Listar todos os treinos
      try {
        const result = await pool.query('SELECT * FROM workouts ORDER BY created_at DESC');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result.rows)
        };
      } catch (error) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: error.message })
        };
      }
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Método não permitido' })
  };
}

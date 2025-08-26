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
          return await handleAuth(event, headers, id, action);
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

// Função para autenticação (simulada)
async function handleAuth(event, headers, id, action) {
  // Login
  if (event.httpMethod === 'POST' && !id) {
    try {
      const { email, password } = JSON.parse(event.body);
      
      // Simular autenticação (sem banco de dados)
      if (email === 'admin@teste.com' && password === 'admin123') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            user: {
              id: 1,
              name: 'Admin',
              email: 'admin@teste.com'
            },
            token: 'test-token-123'
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
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Dados inválidos' })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Método não permitido' })
  };
}

// Função para gerenciar usuários (simulada)
async function handleUsers(event, headers, id) {
  if (event.httpMethod === 'POST') {
    try {
      const { name, email, password } = JSON.parse(event.body);
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          id: 1,
          name,
          email
        })
      };
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Dados inválidos' })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Método não permitido' })
  };
}

// Função para gerenciar alunos (simulada)
async function handleStudents(event, headers, id, action) {
  if (event.httpMethod === 'POST' && !id) {
    try {
      const { name, accessCode, userId } = JSON.parse(event.body);
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          id: 1,
          name,
          access_code: accessCode,
          user_id: userId
        })
      };
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Dados inválidos' })
      };
    }
  }

  if (event.httpMethod === 'GET') {
    // Simular dados de alunos
    const students = [
      { id: 1, name: 'João Silva', access_code: 'TEST123' },
      { id: 2, name: 'Maria Santos', access_code: 'TEST456' }
    ];
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(students)
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Método não permitido' })
  };
}

// Função para gerenciar treinos (simulada)
async function handleWorkouts(event, headers, id, action) {
  if (event.httpMethod === 'POST' && !id) {
    try {
      const { name, description, studentId, exercises } = JSON.parse(event.body);
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          id: 1,
          name,
          description,
          student_id: studentId
        })
      };
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Dados inválidos' })
      };
    }
  }

  if (event.httpMethod === 'GET') {
    // Simular dados de treinos
    const workouts = [
      { id: 1, name: 'Treino A', description: 'Treino de força' },
      { id: 2, name: 'Treino B', description: 'Treino de cardio' }
    ];
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(workouts)
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Método não permitido' })
  };
}

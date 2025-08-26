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

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      const { email, password } = body;
      
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
      } else {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Credenciais inválidas' })
        };
      }
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
};

const axios = require('axios');

async function testDebug() {
  try {
    console.log('🔍 Testando debug do backend...');
    
    // Testar diferentes formatos de requisição
    const testCases = [
      {
        name: 'Teste 1: Formato simples',
        data: {
          path: '/api/auth',
          httpMethod: 'POST',
          body: '{"email":"admin@teste.com","password":"admin123"}'
        }
      },
      {
        name: 'Teste 2: Com path completo',
        data: {
          path: '/.netlify/functions/index/api/auth',
          httpMethod: 'POST',
          body: '{"email":"admin@teste.com","password":"admin123"}'
        }
      },
      {
        name: 'Teste 3: Sem path',
        data: {
          httpMethod: 'POST',
          body: '{"email":"admin@teste.com","password":"admin123"}'
        }
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n🧪 ${testCase.name}...`);
      try {
        const response = await axios.post('https://gymconnectt.netlify.app/.netlify/functions/index', testCase.data, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Sucesso!');
        console.log('📊 Status:', response.status);
        console.log('📄 Resposta:', response.data);
        
      } catch (error) {
        console.error('❌ Falhou:');
        if (error.response) {
          console.error('📊 Status:', error.response.status);
          console.error('📄 Resposta:', error.response.data);
        } else {
          console.error('🔍 Erro:', error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testDebug();

const axios = require('axios');

async function testBackend() {
  try {
    console.log('🧪 Testando backend...');
    
    // Testar endpoint de autenticação
    const response = await axios.post('https://gymconnectt.netlify.app/.netlify/functions/index', {
      path: '/api/auth',
      httpMethod: 'POST',
      body: JSON.stringify({
        email: 'admin@teste.com',
        password: 'admin123'
      })
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Backend funcionando!');
    console.log('📊 Status:', response.status);
    console.log('📄 Resposta:', response.data);
    
  } catch (error) {
    console.error('❌ Erro no backend:');
    console.error('📊 Status:', error.response?.status);
    console.error('📄 Resposta:', error.response?.data);
    console.error('🔍 Erro completo:', error.message);
    
    // Testar se o problema é o formato da requisição
    console.log('\n🔄 Testando formato alternativo...');
    try {
      const response2 = await axios.post('https://gymconnectt.netlify.app/.netlify/functions/index', {
        path: '/api/auth',
        httpMethod: 'POST',
        body: '{"email":"admin@teste.com","password":"admin123"}'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Formato alternativo funcionou!');
      console.log('📊 Status:', response2.status);
      console.log('📄 Resposta:', response2.data);
      
    } catch (error2) {
      console.error('❌ Formato alternativo também falhou:', error2.message);
    }
  }
}

testBackend();

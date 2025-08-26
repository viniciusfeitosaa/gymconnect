const axios = require('axios');

async function testSimple() {
  try {
    console.log('🧪 Testando backend simples...');
    
    // Testar se o backend responde
    const response = await axios.post('https://gymconnectt.netlify.app/.netlify/functions/index', {
      path: '/api/auth',
      httpMethod: 'POST',
      body: '{"email":"admin@teste.com","password":"admin123"}'
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
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Resposta:', error.response.data);
    } else {
      console.error('🔍 Erro de rede:', error.message);
    }
  }
}

testSimple();

const { Pool } = require('pg');

// Configuração do banco de dados PostgreSQL (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_CB1LSdDMrE2J@ep-crimson-mountain-aeg7vggf-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

// Testar conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao banco PostgreSQL (Neon)');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão com o banco:', err);
});

module.exports = pool;

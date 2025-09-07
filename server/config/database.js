const { Pool } = require('pg');

// String de conexão do Neon PostgreSQL
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_CB1LSdDMrE2J@ep-crimson-mountain-aeg7vggf-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Configuração do pool de conexões
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000, // tempo para fechar conexões inativas
  connectionTimeoutMillis: 2000, // tempo limite para conectar
});

// Testar conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados PostgreSQL (Neon)');
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool de conexões PostgreSQL:', err);
});

// Função para executar queries com promises
const execute = async (query, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
};

// Função para executar uma query e retornar o primeiro resultado
const query = async (query, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};

// Função para executar uma query de inserção/atualização
const executeUpdate = async (query, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return {
      rowCount: result.rowCount,
      rows: result.rows
    };
  } finally {
    client.release();
  }
};

// Função para obter uma conexão (para transações)
const getConnection = async () => {
  const client = await pool.connect();
  
  // Adicionar métodos de transação
  client.beginTransaction = async () => {
    await client.query('BEGIN');
  };
  
  client.commit = async () => {
    await client.query('COMMIT');
  };
  
  client.rollback = async () => {
    await client.query('ROLLBACK');
  };
  
  client.release = () => {
    client.release();
  };
  
  // Adicionar métodos de query
  client.execute = async (query, params = []) => {
    const result = await client.query(query, params);
    return result.rows;
  };
  
  client.query = async (query, params = []) => {
    const result = await client.query(query, params);
    return result.rows[0] || null;
  };
  
  client.executeUpdate = async (query, params = []) => {
    const result = await client.query(query, params);
    return {
      rowCount: result.rowCount,
      rows: result.rows
    };
  };
  
  return client;
};

// Fechar pool ao encerrar o processo
process.on('SIGINT', async () => {
  try {
    await pool.end();
    console.log('Conexão com banco de dados PostgreSQL fechada.');
  } catch (err) {
    console.error('Erro ao fechar banco de dados:', err);
  }
});

// Exportar interface compatível com SQLite
module.exports = {
  execute,
  query,
  executeUpdate,
  getConnection,
  pool
};
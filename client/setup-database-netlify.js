const { Pool } = require('pg');

// Usar as variáveis de ambiente do Netlify
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_CB1LSdDMrE2J@ep-crimson-mountain-aeg7vggf-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  try {
    console.log('🔌 Conectando ao banco de dados Neon...');
    console.log('📡 URL:', DATABASE_URL.substring(0, 50) + '...');
    
    // Testar conexão
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Executar schema
    console.log('📋 Executando schema do banco...');
    
    const schema = `
    -- Tabela de usuários (personal trainers)
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de alunos
    CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        access_code VARCHAR(50) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de treinos
    CREATE TABLE IF NOT EXISTS workouts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de exercícios
    CREATE TABLE IF NOT EXISTS exercises (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sets INTEGER NOT NULL DEFAULT 3,
        reps VARCHAR(100),
        weight VARCHAR(100),
        rest VARCHAR(100),
        notes TEXT,
        workout_id INTEGER REFERENCES workouts(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Índices para melhor performance
    CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
    CREATE INDEX IF NOT EXISTS idx_workouts_student_id ON workouts(student_id);
    CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises(workout_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_students_access_code ON students(access_code);

    -- Trigger para atualizar updated_at automaticamente
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;
    
    await client.query(schema);
    console.log('✅ Schema executado com sucesso!');
    
    // Inserir usuário de teste
    console.log('👤 Criando usuário de teste...');
    const testUser = await client.query(`
      INSERT INTO users (name, email, password_hash) 
      VALUES ('Admin Teste', 'admin@teste.com', 'admin123') 
      ON CONFLICT (email) DO NOTHING 
      RETURNING id, name, email
    `);
    
    if (testUser.rows.length > 0) {
      console.log('✅ Usuário de teste criado:', testUser.rows[0]);
      
      // Criar aluno de teste
      const testStudent = await client.query(`
        INSERT INTO students (name, access_code, user_id) 
        VALUES ('Aluno Teste', 'TEST123', $1) 
        ON CONFLICT (access_code) DO NOTHING 
        RETURNING id, name, access_code
      `, [testUser.rows[0].id]);
      
      if (testStudent.rows.length > 0) {
        console.log('✅ Aluno de teste criado:', testStudent.rows[0]);
      }
    }
    
    client.release();
    console.log('🎉 Banco de dados configurado com sucesso!');
    console.log('\n📱 Credenciais de teste:');
    console.log('Email: admin@teste.com');
    console.log('Senha: admin123');
    console.log('Código de acesso: TEST123');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();

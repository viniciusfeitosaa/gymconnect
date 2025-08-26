const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateDatabase() {
  try {
    console.log('🔌 Conectando ao banco de dados...');
    
    // Testar conexão
    const client = await pool.connect();
    console.log('✅ Conectado ao banco de dados!');
    
    // Limpar dados existentes
    console.log('🧹 Limpando dados existentes...');
    await client.query('DELETE FROM exercises');
    await client.query('DELETE FROM workouts');
    await client.query('DELETE FROM students');
    await client.query('DELETE FROM users');
    
    // Resetar sequências
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE students_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE workouts_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE exercises_id_seq RESTART WITH 1');
    
    // Criar usuário admin com senha hasheada
    console.log('👤 Criando usuário admin...');
    const adminPassword = 'admin123';
    const saltRounds = 10;
    const hashedAdminPassword = await bcrypt.hash(adminPassword, saltRounds);
    
    const adminResult = await client.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      ['Admin', 'admin@teste.com', hashedAdminPassword]
    );
    
    const adminId = adminResult.rows[0].id;
    console.log(`✅ Usuário admin criado: ${adminResult.rows[0].email}`);
    
    // Criar alunos de teste
    console.log('👥 Criando alunos de teste...');
    const students = [
      { name: 'João Silva', accessCode: 'TEST123' },
      { name: 'Maria Santos', accessCode: 'TEST456' },
      { name: 'Pedro Costa', accessCode: 'TEST789' }
    ];
    
    for (const student of students) {
      await client.query(
        'INSERT INTO students (name, access_code, user_id) VALUES ($1, $2, $3)',
        [student.name, student.accessCode, adminId]
      );
      console.log(`✅ Aluno criado: ${student.name} (${student.accessCode})`);
    }
    
    // Criar treinos de exemplo
    console.log('💪 Criando treinos de exemplo...');
    const workoutResult = await client.query(
      'INSERT INTO workouts (name, description, student_id) VALUES ($1, $2, $3) RETURNING id',
      ['Treino A - Superior', 'Treino focado em membros superiores', 1]
    );
    
    const workoutId = workoutResult.rows[0].id;
    
    // Criar exercícios
    const exercises = [
      { name: 'Supino Reto', sets: 3, reps: '8-12', weight: '60kg', rest: '2min' },
      { name: 'Puxada na Frente', sets: 3, reps: '10-15', weight: '45kg', rest: '2min' },
      { name: 'Desenvolvimento', sets: 3, reps: '8-12', weight: '40kg', rest: '2min' }
    ];
    
    for (const exercise of exercises) {
      await client.query(
        'INSERT INTO exercises (name, sets, reps, weight, rest, workout_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [exercise.name, exercise.sets, exercise.reps, exercise.weight, exercise.rest, workoutId]
      );
      console.log(`✅ Exercício criado: ${exercise.name}`);
    }
    
    console.log('\n🎉 Banco de dados atualizado com sucesso!');
    console.log('\n📋 Credenciais para teste:');
    console.log('👤 Admin: admin@teste.com / admin123');
    console.log('👥 Alunos: TEST123, TEST456, TEST789');
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Erro ao atualizar banco:', error);
    process.exit(1);
  }
}

updateDatabase();

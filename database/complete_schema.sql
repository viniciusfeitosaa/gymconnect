-- Schema completo para GymConnect - SQLite
-- Execute este script para criar todas as tabelas necessárias

-- 1. Criar tabela de personal trainers (usuários)
CREATE TABLE IF NOT EXISTS personal_trainers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  plan_id VARCHAR(50) DEFAULT 'free',
  plan_status VARCHAR(20) DEFAULT 'active',
  plan_expires_at DATETIME NULL,
  subscription_id VARCHAR(255) NULL
);

-- 2. Criar tabela de alunos
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  personal_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  access_code TEXT UNIQUE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (personal_id) REFERENCES personal_trainers(id) ON DELETE CASCADE
);

-- 3. Criar tabela de treinos
CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  personal_id TEXT NOT NULL,
  student_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (personal_id) REFERENCES personal_trainers(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 4. Criar tabela de exercícios
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sets INTEGER DEFAULT 3,
  reps TEXT,
  weight TEXT,
  rest TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);

-- 5. Criar tabela de planos
CREATE TABLE IF NOT EXISTS plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  max_students INT NULL, -- NULL = ilimitado
  features TEXT, -- JSON como texto
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL, -- active, cancelled, expired, pending
  mercadopago_subscription_id VARCHAR(255) NULL,
  starts_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NULL,
  cancelled_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES personal_trainers(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

-- 7. Inserir planos padrão
INSERT OR REPLACE INTO plans (id, name, price, max_students, features) VALUES
('free', 'Gratuito', 0.00, 1, '["1 aluno", "Treinos ilimitados", "Acesso básico ao dashboard", "Suporte por email"]'),
('basic', 'Básico', 15.00, 4, '["Até 4 alunos", "Treinos ilimitados", "Dashboard completo", "Relatórios de progresso", "Suporte prioritário", "Backup automático"]'),
('premium', 'Premium', 29.90, NULL, '["Alunos ilimitados", "Treinos ilimitados", "Dashboard avançado", "Relatórios detalhados", "Integração com apps", "API personalizada", "Suporte 24/7", "Backup em nuvem"]');

-- 8. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_personal_trainers_email ON personal_trainers(email);
CREATE INDEX IF NOT EXISTS idx_personal_trainers_plan_id ON personal_trainers(plan_id);
CREATE INDEX IF NOT EXISTS idx_students_personal_id ON students(personal_id);
CREATE INDEX IF NOT EXISTS idx_students_access_code ON students(access_code);
CREATE INDEX IF NOT EXISTS idx_workouts_personal_id ON workouts(personal_id);
CREATE INDEX IF NOT EXISTS idx_workouts_student_id ON workouts(student_id);
CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_mercadopago_id ON subscriptions(mercadopago_subscription_id);

-- 9. Inserir dados de exemplo (opcional)
INSERT OR IGNORE INTO personal_trainers (id, name, email, password) VALUES 
('1', 'João Silva', 'joao@example.com', 'senha123'),
('2', 'Maria Santos', 'maria@example.com', 'senha456');

INSERT OR IGNORE INTO students (id, personal_id, name, access_code) VALUES 
('1', '1', 'Pedro Costa', 'ABC123'),
('2', '1', 'Ana Oliveira', 'DEF456'),
('3', '2', 'Carlos Lima', 'GHI789');

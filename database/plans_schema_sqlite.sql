-- Schema para sistema de planos - SQLite
-- Execute este script no seu banco de dados SQLite

-- 1. Adicionar colunas à tabela personal_trainers existente
ALTER TABLE personal_trainers ADD COLUMN plan_id VARCHAR(50) DEFAULT 'free';
ALTER TABLE personal_trainers ADD COLUMN plan_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE personal_trainers ADD COLUMN plan_expires_at DATETIME NULL;
ALTER TABLE personal_trainers ADD COLUMN subscription_id VARCHAR(255) NULL;

-- 2. Criar tabela de planos
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

-- 3. Criar tabela de assinaturas
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

-- 4. Inserir planos padrão
INSERT OR REPLACE INTO plans (id, name, price, max_students, features) VALUES
('free', 'Gratuito', 0.00, 1, '["1 aluno", "Treinos ilimitados", "Acesso básico ao dashboard", "Suporte por email"]'),
('basic', 'Básico', 15.00, 4, '["Até 4 alunos", "Treinos ilimitados", "Dashboard completo", "Relatórios de progresso", "Suporte prioritário", "Backup automático"]'),
('premium', 'Premium', 29.90, NULL, '["Alunos ilimitados", "Treinos ilimitados", "Dashboard avançado", "Relatórios detalhados", "Integração com apps", "API personalizada", "Suporte 24/7", "Backup em nuvem"]');

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_personal_trainers_plan_id ON personal_trainers(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_mercadopago_id ON subscriptions(mercadopago_subscription_id);

-- 6. Atualizar usuários existentes para plano gratuito
UPDATE personal_trainers SET plan_id = 'free' WHERE plan_id IS NULL;

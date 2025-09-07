-- Schema para sistema de planos
-- Execute este script no seu banco de dados

-- 1. Adicionar colunas à tabela users existente
ALTER TABLE users ADD COLUMN plan_id VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN plan_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN plan_expires_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN subscription_id VARCHAR(255) NULL;

-- 2. Criar tabela de planos
CREATE TABLE IF NOT EXISTS plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  max_students INT NULL, -- NULL = ilimitado
  features JSON, -- Array de features
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  user_id INT NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL, -- active, cancelled, expired, pending
  mercadopago_subscription_id VARCHAR(255) NULL,
  starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

-- 4. Inserir planos padrão
INSERT INTO plans (id, name, price, max_students, features) VALUES
('free', 'Gratuito', 0.00, 1, '["1 aluno", "Treinos ilimitados", "Acesso básico ao dashboard", "Suporte por email"]'),
('basic', 'Básico', 15.00, 4, '["Até 4 alunos", "Treinos ilimitados", "Dashboard completo", "Relatórios de progresso", "Suporte prioritário", "Backup automático"]'),
('premium', 'Premium', 29.90, NULL, '["Alunos ilimitados", "Treinos ilimitados", "Dashboard avançado", "Relatórios detalhados", "Integração com apps", "API personalizada", "Suporte 24/7", "Backup em nuvem"]')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  price = VALUES(price),
  max_students = VALUES(max_students),
  features = VALUES(features),
  updated_at = CURRENT_TIMESTAMP;

-- 5. Criar índices para performance
CREATE INDEX idx_users_plan_id ON users(plan_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_mercadopago_id ON subscriptions(mercadopago_subscription_id);

-- 6. Atualizar usuários existentes para plano gratuito
UPDATE users SET plan_id = 'free' WHERE plan_id IS NULL;

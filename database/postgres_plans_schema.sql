-- Schema para sistema de planos - PostgreSQL
-- Execute este script no seu banco de dados PostgreSQL

-- 1. Adicionar colunas à tabela personal_trainers existente
ALTER TABLE personal_trainers ADD COLUMN IF NOT EXISTS plan_id VARCHAR(50) DEFAULT 'free';
ALTER TABLE personal_trainers ADD COLUMN IF NOT EXISTS plan_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE personal_trainers ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP NULL;
ALTER TABLE personal_trainers ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255) NULL;

-- 2. Criar tabela de planos
CREATE TABLE IF NOT EXISTS plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  max_students INT NULL, -- NULL = ilimitado
  features JSONB, -- Array de features como JSON
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL, -- active, cancelled, expired, pending
  mercadopago_subscription_id VARCHAR(255) NULL,
  starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES personal_trainers(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

-- 4. Inserir planos padrão
INSERT INTO plans (id, name, price, max_students, features) VALUES
('free', 'Gratuito', 0.00, 1, '["1 aluno", "Treinos ilimitados", "Acesso básico ao dashboard", "Suporte por email"]'),
('basic', 'Básico', 15.00, 4, '["Até 4 alunos", "Treinos ilimitados", "Dashboard completo", "Relatórios de progresso", "Suporte prioritário", "Backup automático"]'),
('premium', 'Premium', 29.90, NULL, '["Alunos ilimitados", "Treinos ilimitados", "Dashboard avançado", "Relatórios detalhados", "Integração com apps", "API personalizada", "Suporte 24/7", "Backup em nuvem"]')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  max_students = EXCLUDED.max_students,
  features = EXCLUDED.features,
  updated_at = CURRENT_TIMESTAMP;

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_personal_trainers_plan_id ON personal_trainers(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_mercadopago_id ON subscriptions(mercadopago_subscription_id);

-- 6. Atualizar usuários existentes para plano gratuito
UPDATE personal_trainers SET plan_id = 'free' WHERE plan_id IS NULL;

-- 7. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas
DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at 
    BEFORE UPDATE ON plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

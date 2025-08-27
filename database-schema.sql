-- =====================================================
-- ESQUEMA DO BANCO DE DADOS GYMCONNECT
-- =====================================================

-- Tabela de Personal Trainers
CREATE TABLE personals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Alunos
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    personal_id INTEGER NOT NULL REFERENCES personals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    access_code VARCHAR(50) UNIQUE NOT NULL,
    notes TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Treinos
CREATE TABLE workouts (
    id SERIAL PRIMARY KEY,
    personal_id INTEGER NOT NULL REFERENCES personals(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Exercícios
CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight VARCHAR(50),
    rest VARCHAR(50),
    notes TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para consultas frequentes
CREATE INDEX idx_students_personal_id ON students(personal_id);
CREATE INDEX idx_students_access_code ON students(access_code);
CREATE INDEX idx_workouts_personal_id ON workouts(personal_id);
CREATE INDEX idx_workouts_student_id ON workouts(student_id);
CREATE INDEX idx_exercises_workout_id ON exercises(workout_id);

-- Índices para ordenação
CREATE INDEX idx_personals_created_at ON personals(created_at);
CREATE INDEX idx_students_join_date ON students(join_date);
CREATE INDEX idx_workouts_created_at ON workouts(created_at);
CREATE INDEX idx_exercises_order_index ON exercises(order_index);

-- =====================================================
-- DADOS DE EXEMPLO
-- =====================================================

-- Inserir personal trainer de exemplo
INSERT INTO personals (name, email, password_hash) VALUES 
('João Silva', 'joao@academia.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.');

-- Inserir alunos de exemplo
INSERT INTO students (personal_id, name, access_code, notes, join_date) VALUES 
(1, 'Ana Beatriz', 'ANA001', 'Foco em hipertrofia', '2024-01-15'),
(1, 'Carlos Eduardo', 'CAR002', 'Recuperação de lesão', '2024-01-10'),
(1, 'Fernanda Lima', 'FER003', 'Preparação para maratona', '2024-01-12');

-- Inserir treinos de exemplo
INSERT INTO workouts (personal_id, student_id, name, description) VALUES 
(1, 1, 'Treino A - Força Superior', 'Foco em desenvolvimento de força para membros superiores'),
(1, 2, 'Treino B - Inferiores', 'Desenvolvimento de força para membros inferiores'),
(1, 3, 'Treino C - Cardio e Core', 'Treino de resistência cardiovascular e core');

-- Inserir exercícios de exemplo
INSERT INTO exercises (workout_id, name, sets, reps, weight, rest, notes, order_index) VALUES 
(1, 'Supino Reto', 4, 8, '60kg', '2 min', 'Manter ombros para trás', 1),
(1, 'Remada Curvada', 4, 10, '45kg', '90 seg', 'Costas retas', 2),
(2, 'Agachamento Livre', 4, 8, '80kg', '3 min', 'Joelhos alinhados', 1),
(2, 'Leg Press', 3, 12, '120kg', '2 min', 'Pés na largura dos ombros', 2),
(3, 'Corrida na Esteira', 1, 1, NULL, '5 min', '20 minutos em ritmo moderado', 1),
(3, 'Plank', 3, 1, NULL, '60 seg', '45 segundos cada', 2);

-- =====================================================
-- CONSULTAS ÚTEIS
-- =====================================================

-- Dashboard stats para um personal
-- SELECT 
--     COUNT(DISTINCT s.id) as total_students,
--     COUNT(DISTINCT w.id) as total_workouts,
--     COUNT(DISTINCT e.id) as total_exercises
-- FROM personals p
-- LEFT JOIN students s ON s.personal_id = p.id
-- LEFT JOIN workouts w ON w.personal_id = p.id
-- LEFT JOIN exercises e ON e.workout_id = w.id
-- WHERE p.id = $1;

-- Listar alunos de um personal com contagem de treinos
-- SELECT 
--     s.*,
--     COUNT(w.id) as workout_count
-- FROM students s
-- LEFT JOIN workouts w ON w.student_id = s.id
-- WHERE s.personal_id = $1
-- GROUP BY s.id
-- ORDER BY s.created_at DESC;

-- Listar treinos de um personal com dados do aluno
-- SELECT 
--     w.*,
--     s.name as student_name,
--     s.access_code as student_access_code
-- FROM workouts w
-- JOIN students s ON s.id = w.student_id
-- WHERE w.personal_id = $1
-- ORDER BY w.created_at DESC;

-- =====================================================
-- TRIGGERS PARA ATUALIZAR TIMESTAMPS
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_personals_updated_at BEFORE UPDATE ON personals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'gymconnect-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar banco de dados
const db = new sqlite3.Database('./gymconnect.db');

// Criar tabelas
db.serialize(() => {
  // Tabela de personal trainers
  db.run(`CREATE TABLE IF NOT EXISTS personal_trainers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de alunos
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    personal_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    access_code TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (personal_id) REFERENCES personal_trainers (id)
  )`);

  // Tabela de treinos
  db.run(`CREATE TABLE IF NOT EXISTS workouts (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    personal_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    exercises TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students (id),
    FOREIGN KEY (personal_id) REFERENCES personal_trainers (id)
  )`);
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rotas de autenticação
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    db.run(
      'INSERT INTO personal_trainers (id, name, email, password) VALUES (?, ?, ?, ?)',
      [id, name, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email já cadastrado' });
          }
          return res.status(500).json({ error: 'Erro ao cadastrar personal' });
        }

        const token = jwt.sign({ id, email, name }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id, name, email } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    db.get(
      'SELECT * FROM personal_trainers WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de alunos
app.post('/api/students', authenticateToken, (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const personalId = req.user.id;
    
    if (!name) {
      return res.status(400).json({ error: 'Nome do aluno é obrigatório' });
    }

    const id = uuidv4();
    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    db.run(
      'INSERT INTO students (id, personal_id, name, email, phone, access_code) VALUES (?, ?, ?, ?, ?, ?)',
      [id, personalId, name, email || '', phone || '', accessCode],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Erro ao criar aluno' });
        }

        res.json({ 
          id, 
          name, 
          email, 
          phone, 
          access_code: accessCode,
          personal_id: personalId 
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/students', authenticateToken, (req, res) => {
  const personalId = req.user.id;
  
  db.all(
    'SELECT * FROM students WHERE personal_id = ? ORDER BY created_at DESC',
    [personalId],
    (err, students) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar alunos' });
      }
      res.json(students);
    }
  );
});

// Rotas de treinos
app.post('/api/workouts', authenticateToken, (req, res) => {
  try {
    const { studentId, name, description, exercises } = req.body;
    const personalId = req.user.id;
    
    if (!studentId || !name || !exercises) {
      return res.status(400).json({ error: 'ID do aluno, nome e exercícios são obrigatórios' });
    }

    const id = uuidv4();
    const exercisesJson = JSON.stringify(exercises);

    db.run(
      'INSERT INTO workouts (id, student_id, personal_id, name, description, exercises) VALUES (?, ?, ?, ?, ?, ?)',
      [id, studentId, personalId, name, description || '', exercisesJson],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Erro ao criar treino' });
        }

        res.json({ 
          id, 
          student_id: studentId, 
          personal_id: personalId, 
          name, 
          description, 
          exercises: JSON.parse(exercisesJson)
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/workouts/:studentId', authenticateToken, (req, res) => {
  const { studentId } = req.params;
  const personalId = req.user.id;
  
  db.all(
    'SELECT * FROM workouts WHERE student_id = ? AND personal_id = ? ORDER BY created_at DESC',
    [studentId, personalId],
    (err, workouts) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar treinos' });
      }
      
      const workoutsWithExercises = workouts.map(workout => ({
        ...workout,
        exercises: JSON.parse(workout.exercises)
      }));
      
      res.json(workoutsWithExercises);
    }
  );
});

// Rota para alunos acessarem treinos (sem autenticação)
app.post('/api/student-access', (req, res) => {
  try {
    const { accessCode } = req.body;
    
    if (!accessCode) {
      return res.status(400).json({ error: 'Código de acesso é obrigatório' });
    }

    db.get(
      'SELECT s.*, p.name as personal_name FROM students s JOIN personal_trainers p ON s.personal_id = p.id WHERE s.access_code = ?',
      [accessCode],
      (err, student) => {
        if (err) {
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }

        if (!student) {
          return res.status(404).json({ error: 'Código de acesso inválido' });
        }

        // Buscar treinos do aluno
        db.all(
          'SELECT * FROM workouts WHERE student_id = ? ORDER BY created_at DESC',
          [student.id],
          (err, workouts) => {
            if (err) {
              return res.status(500).json({ error: 'Erro ao buscar treinos' });
            }

            const workoutsWithExercises = workouts.map(workout => ({
              ...workout,
              exercises: JSON.parse(workout.exercises)
            }));

            res.json({
              student: {
                id: student.id,
                name: student.name,
                personal_name: student.personal_name
              },
              workouts: workoutsWithExercises
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para verificar se o personal está autenticado
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

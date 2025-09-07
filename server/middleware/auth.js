const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gymconnect-secret-key-2024';

/**
 * Middleware de autenticação
 * Verifica se o token JWT é válido
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Token de acesso necessário',
      message: 'Você precisa estar logado para acessar este recurso',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Token inválido',
        message: 'Sua sessão expirou. Faça login novamente.',
      });
    }

    req.user = user;
    next();
  });
};

/**
 * Middleware opcional de autenticação
 * Não falha se não houver token, mas adiciona user se houver
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

/**
 * Middleware para verificar se o usuário é admin
 * (Para futuras implementações)
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Autenticação necessária',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Você precisa ser administrador para acessar este recurso',
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
};

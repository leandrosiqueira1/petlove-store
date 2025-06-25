const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET;

function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(403).json({ erro: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1]; // Remove o "Bearer "

  try {
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.id;
    req.admin = decoded.admin; // ← pega o campo admin do token
    next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

module.exports = autenticar;

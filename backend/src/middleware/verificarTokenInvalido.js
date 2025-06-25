const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const secret = process.env.JWT_SECRET;

async function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ erro: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const resultado = await pool.query('SELECT * FROM tokens_invalidos WHERE token = $1', [token]);

    if (resultado.rows.length > 0) {
      return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }

    const payload = jwt.verify(token, secret); // Aqui verifica se o token ainda é válido (expiração, assinatura)
    req.usuario = payload;

    next();
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

module.exports = verificarToken;

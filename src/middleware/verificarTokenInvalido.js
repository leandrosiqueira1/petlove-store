const pool = require('../config/db');

async function verificarTokenInvalido(req, res, next) {
  const token = req.headers['authorization'];

  require('dotenv').config();
  const secret = process.env.JWT_SECRET;

  if (!token) {
    return res.status(403).json({ erro: 'Token não fornecido' });
  }

  try {
    const resultado = await pool.query('SELECT * FROM tokens_invalidos WHERE token = $1', [token]);

    if (resultado.rows.length > 0) {
      return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
}

module.exports = verificarTokenInvalido;

const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

router.post('/', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido ou formato inválido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.decode(token);

    if (!payload || !payload.exp) {
      return res.status(400).json({ erro: 'Token inválido.' });
    }

    const expira_em = new Date(payload.exp * 1000); // Expiração em milissegundos

    await pool.query('INSERT INTO tokens_invalidos (token, expira_em) VALUES ($1, $2)', [
      token,
      expira_em,
    ]);

    res.status(200).json({ mensagem: 'Logout realizado com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao fazer logout' });
  }
});

module.exports = router;

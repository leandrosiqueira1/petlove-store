const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');

require('dotenv').config();

const router = express.Router();
const secret = process.env.JWT_SECRET;

// Cadastrar usuário com senha criptografada
router.post('/', async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const resultado = await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *',
      [nome, email, senhaCriptografada]
    );

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      usuario: {
        id: resultado.rows[0].id,
        nome: resultado.rows[0].nome,
        email: resultado.rows[0].email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
  }
});

module.exports = router;


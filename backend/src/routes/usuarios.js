const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
require('dotenv').config();

const router = express.Router();
const { validarUsuario } = require('../middleware/validacoes');
const tratarErros = require('../middleware/tratarErros');

// Rota para cadastrar usuário
router.post('/', validarUsuario, tratarErros, async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    // Verifica se o e-mail já existe
    const usuarioExistente = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    }

    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Insere o novo usuário no banco
    const resultado = await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [nome, email, senhaCriptografada]
    );

    const novoUsuario = resultado.rows[0];
    return res.status(201).json(novoUsuario);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

module.exports = router;

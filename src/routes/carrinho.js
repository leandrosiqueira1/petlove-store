const express = require('express');
const pool = require('../config/db');
const autenticar = require('../middleware/auth');

const router = express.Router();

// Adicionar item ao carrinho (somente autenticado)
router.post('/adicionar', autenticar, async (req, res) => {
  const { produto_id, quantidade } = req.body;
  const userId = req.userId;

  try {
    const produto = await pool.query('SELECT * FROM produtos WHERE id = $1', [produto_id]);

    if (produto.rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    await pool.query(
      'INSERT INTO carrinho (produto_id, quantidade, usuario_id) VALUES ($1, $2, $3)',
      [produto_id, quantidade, userId]
    );

    res.status(201).json({ mensagem: 'Produto adicionado ao carrinho' });
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    res.status(500).json({ erro: 'Erro ao adicionar ao carrinho' });
  }
});

// Listar itens do carrinho (somente autenticado)
router.get('/', autenticar, async (req, res) => {
  const userId = req.userId;

  try {
    const resultado = await pool.query(`
      SELECT c.id, p.nome, p.preco, c.quantidade, (p.preco * c.quantidade) AS total
      FROM carrinho c
      JOIN produtos p ON c.produto_id = p.id
      WHERE c.usuario_id = $1
    `, [userId]);

    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Erro ao listar carrinho:', error);
    res.status(500).json({ erro: 'Erro ao listar o carrinho' });
  }
});

module.exports = router;

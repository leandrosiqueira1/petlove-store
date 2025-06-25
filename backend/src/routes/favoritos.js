const express = require('express');
const pool = require('../config/db');
const autenticar = require('../middleware/auth');

const router = express.Router();

// Adicionar produto aos favoritos
router.post('/', autenticar, async (req, res) => {
  const userId = req.userId;
  const { produto_id } = req.body;

  if (!produto_id) {
    return res.status(400).json({ erro: 'ID do produto é obrigatório' });
  }

  try {
    // Verifica se o favorito já existe
    const existe = await pool.query(
      'SELECT * FROM favoritos WHERE usuario_id = $1 AND produto_id = $2',
      [userId, produto_id]
    );

    if (existe.rowCount > 0) {
      return res.status(409).json({ erro: 'Produto já está nos favoritos' });
    }

    // Insere nos favoritos
    await pool.query(
      'INSERT INTO favoritos (usuario_id, produto_id) VALUES ($1, $2)',
      [userId, produto_id]
    );

    res.status(201).json({ mensagem: 'Produto adicionado aos favoritos' });
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    res.status(500).json({ erro: 'Erro interno ao adicionar favorito' });
  }
});

// Listar favoritos do usuário logado
router.get('/', autenticar, async (req, res) => {
  const userId = req.userId;

  try {
    const resultado = await pool.query(`
      SELECT f.id, p.id AS produto_id, p.nome, p.preco, p.imagem_url
      FROM favoritos f
      JOIN produtos p ON f.produto_id = p.id
      WHERE f.usuario_id = $1
    `, [userId]);

    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Erro ao listar favoritos:', error);
    res.status(500).json({ erro: 'Erro interno ao listar favoritos' });
  }
});

// Remover favorito
router.delete('/:id', autenticar, async (req, res) => {
  const userId = req.userId;
  const favoritoId = req.params.id;

  try {
    const resultado = await pool.query(
      'DELETE FROM favoritos WHERE id = $1 AND usuario_id = $2',
      [favoritoId, userId]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Favorito não encontrado ou não pertence ao usuário' });
    }

    res.status(200).json({ mensagem: 'Favorito removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    res.status(500).json({ erro: 'Erro interno ao remover favorito' });
  }
});

module.exports = router;

const express = require('express');
const pool = require('../config/db');
const autenticar = require('../middleware/auth');
const autenticarAdmin = require('../middleware/autenticarAdmin');

const router = express.Router();

// Listar todos os produtos (acesso público)
router.get('/', async (req, res) => {
  try {
    const produtos = await pool.query('SELECT * FROM produtos');
    res.status(200).json(produtos.rows);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar produtos' });
  }
});

// Buscar 1 produto
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const produto = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);

    if (produto.rowCount === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    res.status(200).json(produto.rows[0]);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar produto' });
  }
});

// Criar produto (somente admin)
router.post('/', autenticarAdmin, async (req, res) => {
  const { nome, descricao, preco, imagem } = req.body;

  if (!nome || !preco) {
    return res.status(400).json({ erro: 'Nome e preço são obrigatórios' });
  }

  try {
    const novo = await pool.query(
      'INSERT INTO produtos (nome, descricao, preco, imagem) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, descricao, preco, imagem]
    );
    res.status(201).json(novo.rows[0]);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar produto' });
  }
});

// Editar produto (somente admin)
router.put('/:id', autenticarAdmin, async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, imagem } = req.body;

  try {
    const atualiza = await pool.query(
      'UPDATE produtos SET nome = $1, descricao = $2, preco = $3, imagem = $4 WHERE id = $5 RETURNING *',
      [nome, descricao, preco, imagem, id]
    );

    if (atualiza.rowCount === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    res.status(200).json(atualiza.rows[0]);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar produto' });
  }
});

// Deletar produto (somente admin)
router.delete('/:id', autenticarAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const remove = await pool.query('DELETE FROM produtos WHERE id = $1', [id]);

    if (remove.rowCount === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao deletar produto' });
  }
});

module.exports = router;

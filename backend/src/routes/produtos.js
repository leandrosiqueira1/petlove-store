const express = require('express');
const pool = require('../config/db');
const autenticar = require('../middleware/auth'); // Mantenha se for usado em outras rotas neste arquivo
const autenticarAdmin = require('../middleware/autenticarAdmin');
const { validarProduto } = require('../middleware/validacoes'); // Importe a validação de produto
const tratarErros = require('../middleware/tratarErros'); // Importe o middleware de tratamento de erros

const router = express.Router();

// Listar todos os produtos (acesso público)
router.get('/', async (req, res) => {
  try {
    const produtos = await pool.query('SELECT * FROM produtos');
    res.status(200).json(produtos.rows);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error); // Adicionado log de erro
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
    console.error('Erro ao buscar produto:', error); // Adicionado log de erro
    res.status(500).json({ erro: 'Erro ao buscar produto' });
  }
});

// Criar produto (somente admin)
router.post('/', autenticarAdmin, validarProduto, tratarErros, async (req, res) => {
  // Removido a validação manual, pois o middleware `validarProduto` já faz isso
  const { nome, descricao, preco, categoria, imagem_url, estoque } = req.body; // Adicionado categoria, imagem_url, estoque

  try {
    const novo = await pool.query(
      'INSERT INTO produtos (nome, descricao, preco, categoria, imagem_url, estoque) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nome, descricao, preco, categoria, imagem_url, estoque]
    );
    res.status(201).json(novo.rows[0]);
  } catch (error) {
    console.error('Erro ao criar produto:', error); // Adicionado log de erro
    res.status(500).json({ erro: 'Erro ao criar produto' });
  }
});

// Editar produto (somente admin)
router.put('/:id', autenticarAdmin, validarProduto, tratarErros, async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, categoria, imagem_url, estoque } = req.body; // Adicionado categoria, imagem_url, estoque

  try {
    const atualiza = await pool.query(
      'UPDATE produtos SET nome = $1, descricao = $2, preco = $3, categoria = $4, imagem_url = $5, estoque = $6 WHERE id = $7 RETURNING *',
      [nome, descricao, preco, categoria, imagem_url, estoque, id]
    );

    if (atualiza.rowCount === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    res.status(200).json(atualiza.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error); // Adicionado log de erro
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
    console.error('Erro ao deletar produto:', error); // Adicionado log de erro
    res.status(500).json({ erro: 'Erro ao deletar produto' });
  }
});

module.exports = router;
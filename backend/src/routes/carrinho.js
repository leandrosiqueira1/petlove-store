const express = require('express');
const pool = require('../config/db');
const autenticar = require('../middleware/auth');
const { validarAdicionarCarrinho, validarAtualizarCarrinho } = require('../middleware/validacoes'); // Importe as validações
const tratarErros = require('../middleware/tratarErros'); // Importe o middleware de tratamento de erros

const router = express.Router();

// Adicionar ou atualizar item no carrinho
router.post('/adicionar', autenticar, validarAdicionarCarrinho, tratarErros, async (req, res) => {
  const { produto_id, quantidade } = req.body;
  const userId = req.userId;

  try {
    const produto = await pool.query('SELECT * FROM produtos WHERE id = $1', [produto_id]);

    if (produto.rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    const itemExistente = await pool.query(
      'SELECT * FROM carrinho WHERE produto_id = $1 AND usuario_id = $2',
      [produto_id, userId]
    );

    if (itemExistente.rows.length > 0) {
      // Atualiza a quantidade se o item já estiver no carrinho
      // Verifica se a quantidade a ser adicionada resulta em um estoque negativo
      if (produto.rows[0].estoque !== null && (itemExistente.rows[0].quantidade + quantidade) > produto.rows[0].estoque) {
        return res.status(400).json({ erro: 'Quantidade excede o estoque disponível.' });
      }
      await pool.query(
        'UPDATE carrinho SET quantidade = quantidade + $1 WHERE produto_id = $2 AND usuario_id = $3',
        [quantidade, produto_id, userId]
      );
    } else {
      // Adiciona novo item
      // Verifica se a quantidade inicial excede o estoque
      if (produto.rows[0].estoque !== null && quantidade > produto.rows[0].estoque) {
        return res.status(400).json({ erro: 'Quantidade excede o estoque disponível.' });
      }
      await pool.query(
        'INSERT INTO carrinho (produto_id, quantidade, usuario_id) VALUES ($1, $2, $3)',
        [produto_id, quantidade, userId]
      );
    }

    res.status(201).json({ mensagem: 'Produto adicionado/atualizado no carrinho' });
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    res.status(500).json({ erro: 'Erro ao adicionar ao carrinho' });
  }
});

// Listar itens do carrinho
router.get('/', autenticar, async (req, res) => {
  const userId = req.userId;

  try {
    const resultado = await pool.query(`
      SELECT c.id, p.nome, p.preco, p.imagem_url, c.quantidade, (p.preco * c.quantidade) AS total, p.estoque
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

// Atualizar quantidade de item
router.put('/:id', autenticar, validarAtualizarCarrinho, tratarErros, async (req, res) => {
  const userId = req.userId;
  const itemId = req.params.id;
  const { quantidade } = req.body;

  try {
    // Buscar o item do carrinho e o produto associado para verificar o estoque
    const itemCarrinho = await pool.query(
      `SELECT c.produto_id, p.estoque FROM carrinho c JOIN produtos p ON c.produto_id = p.id WHERE c.id = $1 AND c.usuario_id = $2`,
      [itemId, userId]
    );

    if (itemCarrinho.rowCount === 0) {
      return res.status(404).json({ erro: 'Item não encontrado no carrinho' });
    }

    const { estoque } = itemCarrinho.rows[0];

    // Se o produto tiver controle de estoque e a nova quantidade for maior que o estoque disponível
    if (estoque !== null && quantidade > estoque) {
      return res.status(400).json({ erro: `Quantidade excede o estoque disponível (${estoque}).` });
    }

    const resultado = await pool.query(
      'UPDATE carrinho SET quantidade = $1 WHERE id = $2 AND usuario_id = $3',
      [quantidade, itemId, userId]
    );

    res.json({ mensagem: 'Quantidade atualizada' });
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({ erro: 'Erro ao atualizar item do carrinho' });
  }
});

// Remover item do carrinho
router.delete('/:id', autenticar, async (req, res) => {
  const userId = req.userId;
  const itemId = req.params.id;

  try {
    const resultado = await pool.query(
      'DELETE FROM carrinho WHERE id = $1 AND usuario_id = $2',
      [itemId, userId]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Item não encontrado no carrinho' });
    }

    res.json({ mensagem: 'Item removido do carrinho' });
  } catch (error) {
    console.error('Erro ao remover item:', error);
    res.status(500).json({ erro: 'Erro ao remover item do carrinho' });
  }
});

// Esvaziar carrinho
router.delete('/', autenticar, async (req, res) => {
  const userId = req.userId;

  try {
    await pool.query('DELETE FROM carrinho WHERE usuario_id = $1', [userId]);
    res.json({ mensagem: 'Carrinho esvaziado' });
  } catch (error) {
    console.error('Erro ao esvaziar carrinho:', error);
    res.status(500).json({ erro: 'Erro ao esvaziar o carrinho' });
  }
});

module.exports = router;
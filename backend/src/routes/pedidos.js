const express = require('express');
const pool = require('../config/db');
const autenticar = require('../middleware/auth');

const router = express.Router();

// Listar todos os pedidos do usuário logado
router.get('/', autenticar, async (req, res) => {
  const userId = req.userId;

  try {
    const pedidos = await pool.query(
      `SELECT id, criado_em AS data_pedido, total 
       FROM pedidos 
       WHERE usuario_id = $1 
       ORDER BY criado_em DESC`,
      [userId]
    );
    res.status(200).json(pedidos.rows);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ erro: 'Erro ao listar pedidos' });
  }
});

// Criar pedido a partir dos itens no carrinho
router.post('/', autenticar, async (req, res) => {
  const userId = req.userId;

  try {
    // Buscar itens do carrinho sem pedido associado
    const carrinhoItens = await pool.query(
      `SELECT c.produto_id, c.quantidade, p.preco 
       FROM carrinho c 
       JOIN produtos p ON c.produto_id = p.id 
       WHERE c.usuario_id = $1 AND c.pedido_id IS NULL`,
      [userId]
    );

    if (carrinhoItens.rows.length === 0) {
      return res.status(400).json({ erro: 'Carrinho vazio' });
    }

    // Calcular total do pedido
    let total = 0;
    carrinhoItens.rows.forEach(item => {
      total += item.preco * item.quantidade;
    });

    await pool.query('BEGIN');

    // Inserir novo pedido
    const novoPedido = await pool.query(
      `INSERT INTO pedidos (usuario_id, total) 
       VALUES ($1, $2) 
       RETURNING id, criado_em AS data_pedido, total`,
      [userId, total]
    );

    const pedidoId = novoPedido.rows[0].id;

    // Inserir itens do pedido
    for (const item of carrinhoItens.rows) {
      await pool.query(
        `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) 
         VALUES ($1, $2, $3, $4)`,
        [pedidoId, item.produto_id, item.quantidade, item.preco]
      );
    }

    // Limpar carrinho (remover itens já pedidos)
    await pool.query(
      `DELETE FROM carrinho WHERE usuario_id = $1 AND pedido_id IS NULL`,
      [userId]
    );

    await pool.query('COMMIT');

    res.status(201).json({
      mensagem: 'Pedido criado com sucesso!',
      pedido: novoPedido.rows[0]
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ erro: 'Erro ao criar pedido' });
  }
});

// Detalhes de um pedido específico
router.get('/:id', autenticar, async (req, res) => {
  const userId = req.userId;
  const pedidoId = req.params.id;

  try {
    // Verifica se o pedido pertence ao usuário
    const pedido = await pool.query(
      `SELECT id, criado_em AS data_pedido, total 
       FROM pedidos 
       WHERE id = $1 AND usuario_id = $2`,
      [pedidoId, userId]
    );

    if (pedido.rows.length === 0) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    // Buscar itens do pedido
    const itens = await pool.query(
      `SELECT ip.produto_id, p.nome, ip.quantidade, ip.preco_unitario 
       FROM itens_pedido ip 
       JOIN produtos p ON ip.produto_id = p.id 
       WHERE ip.pedido_id = $1`,
      [pedidoId]
    );

    res.status(200).json({
      pedido: pedido.rows[0],
      itens: itens.rows
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do pedido:', error);
    res.status(500).json({ erro: 'Erro ao buscar detalhes do pedido' });
  }
});

module.exports = router;

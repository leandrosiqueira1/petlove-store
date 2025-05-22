const express = require('express');
const pool = require('../config/db');
const autenticar = require('../middleware/auth');

require('dotenv').config();

const router = express.Router();
const secret = process.env.JWT_SECRET;


// Finalizar Compra
router.post('/finalizar', autenticar, async (req, res) => {
  const userId = req.userId;

  try {
    // Calcula o total do pedido
    const resultadoCarrinho = await pool.query(`
      SELECT SUM(p.preco * c.quantidade) AS total 
      FROM carrinho c 
      JOIN produtos p ON c.produto_id = p.id 
      WHERE c.usuario_id = $1 AND c.pedido_id IS NULL
    `, [userId]);

    const total = parseFloat(resultadoCarrinho.rows[0].total);

    if (!total) {
      return res.status(400).json({ erro: 'Carrinho vazio ou já finalizado' });
    }

    // Cria o pedido
    const novoPedido = await pool.query(`
      INSERT INTO pedidos (usuario_id, total) 
      VALUES ($1, $2) 
      RETURNING id, data_pedido, total
    `, [userId, total]);

    const pedidoId = novoPedido.rows[0].id;

    // Atualiza os itens do carrinho associando-os ao pedido
    await pool.query(`
      UPDATE carrinho 
      SET pedido_id = $1 
      WHERE usuario_id = $2 AND pedido_id IS NULL
    `, [pedidoId, userId]);

    res.status(201).json({
      mensagem: 'Pedido finalizado com sucesso!',
      pedido: novoPedido.rows[0]
    });

  } catch (error) {
    console.error('Erro ao finalizar pedido:', error);
    res.status(500).json({ erro: 'Erro ao finalizar pedido' });
  }
});

// Listar Pedidos
router.get('/', autenticar, async (req, res) => {
    const userId = req.userId;
  
    try {
      const pedidos = await pool.query(`
        SELECT p.id, p.data_pedido, p.total
        FROM pedidos p
        WHERE p.usuario_id = $1
        ORDER BY p.data_pedido DESC
      `, [userId]);
  
      res.status(200).json(pedidos.rows);
  
    } catch (error) {
      console.error('Erro ao listar pedidos:', error);
      res.status(500).json({ erro: 'Erro ao listar pedidos' });
    }
  });
  

module.exports = router;

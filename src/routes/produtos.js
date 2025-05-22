const express = require('express');
const pool = require("../config/db")

const router = express.Router();

// Cadastrar produto
router.post('/', async (req, res) => {
  const { nome, descricao, preco, imagem, categoria, estoque, favorito } = req.body;

  try {
    const resultado = await pool.query(
      'INSERT INTO produtos (nome, descricao, preco, imagem_url, categoria, estoque, favorito) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [nome, descricao, preco, imagem, categoria, estoque, favorito]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    res.status(500).json({ erro: 'Erro ao cadastrar produto' });
  }
});

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM produtos ORDER BY id DESC');
    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ erro: 'Erro ao listar produtos' });
  }
});

// Atualizar produto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, imagem, categoria, estoque, favorito } = req.body;

  try {
    const resultado = await pool.query(
      'UPDATE produtos SET nome = $1, descricao = $2, preco = $3, imagem = $4, categoria = $5, estoque = $6, favorito = $7 WHERE id = $8 RETURNING *',
      [nome, descricao, preco, imagem, categoria, estoque, favorito, id]
    );

    // Verifica se o produto foi encontrado
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ erro: 'Erro ao atualizar produto' });
  }
});

// Deletar produto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      'DELETE FROM produtos WHERE id = $1 RETURNING *',
      [id]
    );

    // Verifica se o produto foi encontrado
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    res.status(200).json({ mensagem: 'Produto deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ erro: 'Erro ao deletar produto' });
  }
});

//Buscar apenas os produtos favoritos 
router.get('/favoritos', async(req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM produtos WHERE favoritos = true');
    res.status(200).json(resultado.rows);

  } catch (error){
      console.error('Erro ao buscar favoritos:', error);
      res.status(500).json({erro:'Erro ao buscar favoritos'});
  }
});

//Buscar produtos por categoria
router.get('/categoria/:categoria',async(req,res) => {
  const {categoria} = req.params;

  try{
    const resultado = await pool.query('SELECT * FROM produtos WHERE categoria = $1', [categoria]);
    res.status(200).json(resultado.rows);
  }catch(error){
    console.error('Erro ao buscar por categoria:',error);
    res.status(500).json({erro:'Error ao buscar por categoria'});
  }
});

// Atualizar produto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, imagem, categoria, estoque, favorito } = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE produtos 
       SET nome = $1, descricao = $2, preco = $3, imagem = $4, 
           categoria = $5, estoque = $6, favorito = $7 
       WHERE id = $8 RETURNING *`,
      [nome, descricao, preco, imagem, categoria, estoque, favorito, id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ erro: 'Erro ao atualizar produto' });
  }
});

// Excluir produto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await pool.query('DELETE FROM produtos WHERE id = $1', [id]);

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    res.status(200).json({ mensagem: 'Produto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ erro: 'Erro ao excluir produto' });
  }
});


module.exports = router;

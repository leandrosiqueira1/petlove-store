const express = require('express');
const usuariosRouter = require('./src/routes/usuarios');
const loginRouter = require('./src/routes/login');
const logoutRouter = require('./src/routes/logout');
const produtosRouter = require('./src/routes/produtos');
const carrinhoRouter = require('./src/routes/carrinho');
const pedidosRouter = require('./src/routes/pedidos');

const limitarRequisicoes = require('./src/middleware/limitarRequisicoes');

const autenticar = require('./src/middleware/auth'); // middleware que valida token e blacklist

const app = express();
app.use(express.json());

app.use(limitarRequisicoes);

// Rotas públicas
app.use('/usuarios', usuariosRouter);
app.use('/login', loginRouter);
app.use('/produtos', produtosRouter);

// Rotas protegidas (precisam de token válido)
app.use('/logout', autenticar, logoutRouter);
app.use('/carrinho', autenticar, carrinhoRouter);
app.use('/pedidos', autenticar, pedidosRouter);

// Inicia servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

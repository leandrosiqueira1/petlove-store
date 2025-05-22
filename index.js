const express = require('express');
const usuariosRouter = require('./src/routes/usuarios');
const loginRouter = require('./src/routes/login');
const logoutRouter = require('./src/routes/logout');
const produtosRouter = require('./src/routes/produtos');
const carrinhoRouter = require('./src/routes/carrinho');
const autenticar = require('./src/middleware/auth');
const verificarTokenInvalido = require('./src/middleware/verificarTokenInvalido');
const pedidosRouter = require('./src/routes/pedidos')

const app = express();
app.use(express.json());

// Rotas públicas
app.use('/usuarios', usuariosRouter);
app.use('/login', loginRouter);
app.use('/produtos', produtosRouter);
app.use('/logout', autenticar, logoutRouter); // Middleware autenticar para logout

// Rotas protegidas
app.use('/carrinho', autenticar, carrinhoRouter); // A autenticação já é feita aqui
app.use('/pedidos',autenticar,pedidosRouter)


// Inicia servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

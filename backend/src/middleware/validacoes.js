const { body } = require('express-validator');

const validarUsuario = [
  body('nome')
    .notEmpty().withMessage('Nome é obrigatório.')
    .isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 letras.')
    .trim(), // Adicionado para remover espaços em branco no início/fim
    
  body('email')
    .notEmpty().withMessage('Email é obrigatório.')
    .isEmail().withMessage('Formato de email inválido.')
    .normalizeEmail(),

  body('senha')
    .notEmpty().withMessage('Senha é obrigatória.')
    .isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres.'),
];

const validarLogin = [
  body('email')
    .notEmpty().withMessage('Email é obrigatório.')
    .isEmail().withMessage('Formato de email inválido.')
    .normalizeEmail(),

  body('senha')
    .notEmpty().withMessage('Senha é obrigatória.'),
];

const validarProduto = [
  body('nome')
    .notEmpty().withMessage('Nome do produto é obrigatório.')
    .isLength({ min: 2 }).withMessage('Nome muito curto.')
    .trim(), // Adicionado para remover espaços em branco
  body('preco')
    .notEmpty().withMessage('Preço é obrigatório.')
    .isFloat({ min: 0.01 }).withMessage('Preço deve ser um número válido e maior que zero.'), // Mínimo 0.01 para evitar preço zero
  body('descricao')
    .optional()
    .isLength({ max: 500 }).withMessage('Descrição muito longa.')
    .trim(),
  body('categoria') // Adicionado validação para categoria
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('Categoria inválida.')
    .trim(),
  body('imagem_url') // Corrigido para imagem_url conforme a tabela de produtos 
    .optional()
    .isURL().withMessage('URL da imagem inválida.'),
  body('estoque') // Adicionado validação para estoque
    .optional()
    .isInt({ min: 0 }).withMessage('Estoque deve ser um número inteiro não negativo.'),
];

const validarAdicionarCarrinho = [
    body('produto_id')
        .isInt({ min: 1 }).withMessage('ID do produto inválido.'),
    body('quantidade')
        .isInt({ min: 1 }).withMessage('Quantidade deve ser um número inteiro positivo.'),
];

const validarAtualizarCarrinho = [ // Adicionado para a rota PUT do carrinho
    body('quantidade')
        .isInt({ min: 1 }).withMessage('Quantidade deve ser um número inteiro positivo.'),
];

const validarFavorito = [
    body('produto_id')
        .isInt({ min: 1 }).withMessage('ID do produto inválido.'),
];

module.exports = {
  validarUsuario,
  validarLogin,
  validarProduto,
  validarAdicionarCarrinho,
  validarAtualizarCarrinho,
  validarFavorito,
};
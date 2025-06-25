const rateLimit = require('express-rate-limit');

const limitarRequisicoes = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo de 100 requisições por IP a cada 15 minutos
  message: {
    erro: 'Muitas requisições feitas pelo mesmo IP. Tente novamente mais tarde.'
  },
  standardHeaders: true, // Retorna rate limit nos headers padrão
  legacyHeaders: false, // Desativa cabeçalhos antigos
});

module.exports = limitarRequisicoes;

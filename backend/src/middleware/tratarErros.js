const { validationResult } = require('express-validator');

function tratarErros(req, res, next) {
  const erros = validationResult(req);

  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array().map(e => e.msg) });
  }

  next();
}

module.exports = tratarErros;

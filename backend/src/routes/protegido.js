const express = require('express');
const verificarToken = require('../middlewares/verificarToken');

const router = express.Router();

router.get('/', verificarToken, (req, res) => {
  // req.usuario foi setado pelo middleware, aqui você pode usar o id, nome, email etc.
  res.json({
    mensagem: 'Acesso autorizado à rota protegida',
    usuario: req.usuario
  });
});

module.exports = router;

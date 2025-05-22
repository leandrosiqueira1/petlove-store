const bcrypt = require('bcrypt');

async function criptografarSenha() {
  const senha = '123456';
  const saltRounds = 10;
  const senhaCriptografada = await bcrypt.hash(senha, saltRounds);
  console.log(senhaCriptografada);
}

criptografarSenha();
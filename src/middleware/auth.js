//const jwt = require('jsonwebtoken');

//const secret = 'segredoSuperSecreto123';

//function autenticar(req, res, next) {
  //const token = req.headers['authorization'];

  //if (!token) {
   // return res.status(403).json({ erro: 'Token não fornecido' });
  //}

  //try {
   // const decoded = jwt.verify(token, secret);
   // req.userId = decoded.id; // Adiciona o ID do usuário à requisição
    //next(); // Deixa o usuário prosseguir
  //} catch (error) {
  //  return res.status(401).json({ erro: 'Token inválido ou expirado' });
 // }
//}

//module.exports = autenticar;

const jwt = require('jsonwebtoken');
require('dotenv').config()

const secret = process.env.JWT_SECRET;

function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(403).json({ erro: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1]; // Remove o "Bearer "

  try {
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

module.exports = autenticar;
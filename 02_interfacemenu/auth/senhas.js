const { scrypt: callback, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const scrypt = promisify(callback);

async function conferirSenha(senha, registro) {
  if (typeof senha !== 'string' || typeof registro !== 'string') return false;
  const partes = registro.split('$');
  if (partes.length !== 3 || partes[0] !== 'scrypt') return false;
  const [, saltHex, hashHex] = partes;
  if (!/^[\da-f]{32}$/i.test(saltHex) || !/^[\da-f]{128}$/i.test(hashHex)) return false;
  const esperado = Buffer.from(hashHex, 'hex');
  const calculado = await scrypt(senha, Buffer.from(saltHex, 'hex'), esperado.length);
  return esperado.length === calculado.length && timingSafeEqual(esperado, calculado);
}
module.exports = { conferirSenha };

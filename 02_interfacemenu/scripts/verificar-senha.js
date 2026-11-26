const { scrypt: scryptCallback, timingSafeEqual } =
  require('node:crypto');

const { promisify } = require('node:util');
const scrypt = promisify(scryptCallback);

async function verificarSenha(senhaInformada, hashArmazenado) {
  const [algoritmo, saltHex, hashHex] =
    hashArmazenado.split('$');

  if (algoritmo !== 'scrypt' || !saltHex || !hashHex) {
    return false;
  }

  const esperado = Buffer.from(hashHex, 'hex');

  const atual = await scrypt(
    senhaInformada,
    Buffer.from(saltHex, 'hex'),
    esperado.length
  );

  return timingSafeEqual(esperado, atual);
}

module.exports = { verificarSenha };
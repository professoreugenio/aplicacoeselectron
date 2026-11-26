
const {
    randomBytes,
    scrypt
} = require('node:crypto');

const { promisify } = require('node:util');

// Reutiliza a verificação de senha do login original
const { conferirSenha } = require('../auth/senhas');

const derivar = promisify(scrypt);

// Gera hashes compatíveis com o login existente
async function gerarHash(senha) {

    if (typeof senha !== 'string' || !senha) {
        throw new Error('Senha inválida.');
    }

    // Gera 16 bytes aleatórios
    const salBytes = randomBytes(16);

    // Sal hexadecimal para armazenamento
    const salHex = salBytes.toString('hex');

    // O scrypt recebe os bytes, não a string hexadecimal
    const hash = await derivar(
        senha,
        salBytes,
        64
    );

    return `scrypt$${salHex}$${hash.toString('hex')}`;
}

// Utiliza exatamente o verificador do login
async function verificarSenha(senha, armazenado) {
    return conferirSenha(senha, armazenado);
}

module.exports = {
    gerarHash,
    verificarSenha
};

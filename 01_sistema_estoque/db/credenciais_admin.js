const {
    randomBytes,
    scrypt,
    timingSafeEqual
} = require('node:crypto');

const { promisify } = require('node:util');

const derivar = promisify(scrypt);

async function gerarHash(senha) {
    const sal = randomBytes(16).toString('hex');
    const hash = await derivar(senha, sal, 64);

    return `scrypt${'$'}${sal}${'$'}${hash.toString('hex')}`;
}

async function verificarSenha(senha, armazenado) {
    if (typeof armazenado !== 'string') {
        return false;
    }

    const partes = armazenado.split('$');

    if (
        partes.length !== 3 ||
        partes[0] !== 'scrypt' ||
        !/^[0-9a-f]{32}$/i.test(partes[1]) ||
        !/^[0-9a-f]{128}$/i.test(partes[2])
    ) {
        return false;
    }

    const [, sal, hashHex] = partes;

    const hashEsperado = Buffer.from(hashHex, 'hex');
    const hashCalculado = await derivar(senha, sal, 64);

    return timingSafeEqual(hashEsperado, hashCalculado);
}

module.exports = {
    gerarHash,
    verificarSenha
};
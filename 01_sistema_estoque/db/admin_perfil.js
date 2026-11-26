const mysql = require('mysql2/promise');
const path = require('node:path');

require('dotenv').config({
    path: path.join(__dirname, '..', '.env')
});

const {
    gerarHash,
    verificarSenha
} = require('./credenciais_admin');

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'estoque_bd',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

async function obterConta(id) {
    const [linhas] = await pool.execute(
        `SELECT
       id_usuario,
       nome_usuario,
       login_usuario,
       email_usuario,
       nivel_usuario,
       ativo_usuario
     FROM usuarios_tb
     WHERE id_usuario = ?`,
        [id]
    );

    return linhas[0] || null;
}

async function listarUsuarios() {
    const [linhas] = await pool.execute(
        `SELECT
       id_usuario,
       nome_usuario,
       login_usuario,
       email_usuario,
       nivel_usuario,
       ativo_usuario,
       data_cadastro
     FROM usuarios_tb
     ORDER BY nome_usuario`
    );

    return linhas;
}

async function registrarHistorico(
    conexao,
    idUsuario,
    acao,
    descricao,
    idRegistro
) {
    await conexao.execute(
        `INSERT INTO historico_tb
       (id_usuario, acao, descricao,
        entidade, id_registro, resultado)
     VALUES (?, ?, ?, 'usuarios_tb', ?, 'SUCESSO')`,
        [idUsuario, acao, descricao, idRegistro]
    );
}

async function cadastrarOperador(dados, idAdmin) {
    const hash = await gerarHash(dados.senha);
    const conexao = await pool.getConnection();

    try {
        await conexao.beginTransaction();

        const [resultado] = await conexao.execute(
            `INSERT INTO usuarios_tb
       (nome_usuario, login_usuario, email_usuario,
        senha_usuario, foto_usuario,
        nivel_usuario, ativo_usuario)
       VALUES (?, ?, ?, ?, 'usuario.jpg', 0, 1)`,
            [
                dados.nome,
                dados.login,
                dados.email,
                hash
            ]
        );

        await registrarHistorico(
            conexao,
            idAdmin,
            'USUARIO_CRIADO',
            'Cadastro de operador',
            resultado.insertId
        );

        await conexao.commit();

        return resultado.insertId;
    } catch (erro) {
        await conexao.rollback();
        throw erro;
    } finally {
        conexao.release();
    }
}

async function alterarSituacao(
    idAlvo,
    ativo,
    idAdmin
) {
    const conexao = await pool.getConnection();

    try {
        await conexao.beginTransaction();

        const [resultado] = await conexao.execute(
            `UPDATE usuarios_tb
       SET ativo_usuario = ?
       WHERE id_usuario = ?
         AND nivel_usuario = 0`,
            [ativo, idAlvo]
        );

        if (resultado.affectedRows !== 1) {
            throw new Error('Operador não encontrado.');
        }

        await registrarHistorico(
            conexao,
            idAdmin,
            ativo === 1
                ? 'USUARIO_REATIVADO'
                : 'USUARIO_BLOQUEADO',
            ativo === 1
                ? 'Reativação de operador'
                : 'Bloqueio de operador',
            idAlvo
        );

        await conexao.commit();

        return true;
    } catch (erro) {
        await conexao.rollback();
        throw erro;
    } finally {
        conexao.release();
    }
}

async function alterarSenha(
    idUsuario,
    senhaAtual,
    senhaNova
) {
    const conexao = await pool.getConnection();

    try {
        await conexao.beginTransaction();

        const [linhas] = await conexao.execute(
            `SELECT senha_usuario
       FROM usuarios_tb
       WHERE id_usuario = ?
         AND ativo_usuario = 1
       FOR UPDATE`,
            [idUsuario]
        );

        if (linhas.length !== 1) {
            throw new Error('Conta não encontrada ou inativa.');
        }

        const confere = await verificarSenha(
            senhaAtual,
            linhas[0].senha_usuario
        );

        if (!confere) {
            throw new Error('Senha atual incorreta.');
        }

        if (senhaAtual === senhaNova) {
            throw new Error(
                'A nova senha deve ser diferente da atual.'
            );
        }

        const novoHash = await gerarHash(senhaNova);

        await conexao.execute(
            `UPDATE usuarios_tb
       SET senha_usuario = ?
       WHERE id_usuario = ?`,
            [novoHash, idUsuario]
        );

        await registrarHistorico(
            conexao,
            idUsuario,
            'SENHA_ALTERADA',
            'Alteração da própria senha',
            idUsuario
        );

        await conexao.commit();

        return true;
    } catch (erro) {
        await conexao.rollback();
        throw erro;
    } finally {
        conexao.release();
    }
}

async function fecharPoolAdmin() {
    await pool.end();
}

module.exports = {
    obterConta,
    listarUsuarios,
    cadastrarOperador,
    alterarSituacao,
    alterarSenha,
    fecharPoolAdmin
};
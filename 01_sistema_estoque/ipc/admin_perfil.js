const { ipcMain } = require('electron');
const path = require('node:path');
const { fileURLToPath } = require('node:url');

const { obterSessao } = require('../auth/sessao');

const banco = require('../db/admin_perfil');

function obterOrigem(evento) {
    try {
        const arquivo = fileURLToPath(
            evento.senderFrame.url
        );

        if (path.dirname(arquivo) !== path.resolve(
            __dirname, '..'
        )) {
            return null;
        }

        return path.basename(arquivo);
    } catch {
        return null;
    }
}

async function autorizar(evento, pagina, admin = false) {
    if (obterOrigem(evento) !== pagina) {
        throw new Error('Origem não autorizada.');
    }

    const sessao = obterSessao();

    if (!sessao) {
        throw new Error('Sessão não autenticada.');
    }

    const id = Number(
        sessao.id ?? sessao.id_usuario
    );

    if (!Number.isSafeInteger(id) || id < 1) {
        throw new Error('Sessão inválida.');
    }

    const conta = await banco.obterConta(id);

    if (!conta || Number(conta.ativo_usuario) !== 1) {
        throw new Error('Conta inexistente ou bloqueada.');
    }

    if (admin && Number(conta.nivel_usuario) !== 1) {
        throw new Error('Acesso exclusivo do administrador.');
    }

    return conta;
}

function respostaErro(erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
        return {
            ok: false,
            erro: 'Login ou e-mail já cadastrado.'
        };
    }

    console.error('[ADMIN/PERFIL]', erro.message);

    const mensagens = [
        'Origem não autorizada.',
        'Sessão não autenticada.',
        'Sessão inválida.',
        'Conta inexistente ou bloqueada.',
        'Acesso exclusivo do administrador.',
        'Operador não encontrado.',
        'Senha atual incorreta.',
        'A nova senha deve ser diferente da atual.'
    ];

    return {
        ok: false,
        erro: mensagens.includes(erro.message)
            ? erro.message
            : 'Não foi possível concluir a operação.'
    };
}

function registrarAdminPerfilHandlers() {
    ipcMain.handle('admin:usuarios:listar', async (evento) => {
        try {
            await autorizar(evento, 'usuarios.html', true);

            return {
                ok: true,
                usuarios: await banco.listarUsuarios()
            };
        } catch (erro) {
            return respostaErro(erro);
        }
    });

    ipcMain.handle('admin:usuarios:criar', async (
        evento, dados
    ) => {
        try {
            const admin = await autorizar(
                evento, 'usuarios.html', true
            );

            if (
                !dados ||
                typeof dados.nome !== 'string' ||
                typeof dados.login !== 'string' ||
                typeof dados.email !== 'string' ||
                typeof dados.senha !== 'string'
            ) {
                throw new Error('Dados inválidos.');
            }

            const nome = dados.nome.trim();
            const login = dados.login.trim();
            const email = dados.email.trim();
            const senha = dados.senha;

            if (
                nome.length < 3 ||
                nome.length > 100 ||
                !/^[a-zA-Z0-9._-]{3,60}$/.test(login) ||
                email.length > 150 ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
                senha.length < 12 ||
                senha.length > 128
            ) {
                return {
                    ok: false,
                    erro: 'Revise os dados e a senha de 12 a 128 caracteres.'
                };
            }

            const id = await banco.cadastrarOperador(
                { nome, login, email, senha },
                admin.id_usuario
            );

            return { ok: true, id };
        } catch (erro) {
            return respostaErro(erro);
        }
    });

    ipcMain.handle('admin:usuarios:situacao', async (
        evento, dados
    ) => {
        try {
            const admin = await autorizar(
                evento, 'usuarios.html', true
            );

            const id = Number(dados?.id);
            const ativo = dados?.ativo;

            if (
                !Number.isSafeInteger(id) ||
                id < 1 ||
                (ativo !== 0 && ativo !== 1)
            ) {
                return {
                    ok: false,
                    erro: 'Parâmetros inválidos.'
                };
            }

            await banco.alterarSituacao(
                id,
                ativo,
                admin.id_usuario
            );

            return { ok: true };
        } catch (erro) {
            return respostaErro(erro);
        }
    });

    ipcMain.handle('perfil:alterarSenha', async (
        evento, dados
    ) => {
        try {
            const usuario = await autorizar(
                evento, 'perfil.html'
            );

            if (
                typeof dados?.atual !== 'string' ||
                typeof dados?.nova !== 'string' ||
                dados.nova.length < 12 ||
                dados.nova.length > 128
            ) {
                return {
                    ok: false,
                    erro: 'Informe uma nova senha de 12 a 128 caracteres.'
                };
            }

            await banco.alterarSenha(
                usuario.id_usuario,
                dados.atual,
                dados.nova
            );

            return { ok: true };
        } catch (erro) {
            return respostaErro(erro);
        }
    });
}

module.exports = { registrarAdminPerfilHandlers };
const api = window.estoqueAPI;

const formulario = document.querySelector(
    '#formNovoUsuario'
);

const areaFormulario = document.querySelector(
    '#areaNovoUsuario'
);

const corpoTabela = document.querySelector(
    '#linhasUsuarios'
);

const mensagem = document.querySelector(
    '#mensagemUsuarios'
);

function avisar(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.className = erro
        ? 'small text-danger'
        : 'small text-success';
}

function adicionarCelula(linha, valor) {
    const celula = document.createElement('td');
    celula.textContent = String(valor ?? '');
    linha.appendChild(celula);
}

async function carregarUsuarios() {
    const resposta = await api.listarUsuarios();

    corpoTabela.replaceChildren();

    if (!resposta.ok) {
        avisar(resposta.erro, true);
        return;
    }

    if (resposta.usuarios.length === 0) {
        const linha = document.createElement('tr');
        const celula = document.createElement('td');

        celula.colSpan = 7;
        celula.textContent = 'Nenhum usuário cadastrado.';

        linha.appendChild(celula);
        corpoTabela.appendChild(linha);
        return;
    }

    for (const usuario of resposta.usuarios) {
        const linha = document.createElement('tr');

        adicionarCelula(linha, usuario.id_usuario);
        adicionarCelula(linha, usuario.nome_usuario);
        adicionarCelula(linha, usuario.login_usuario);
        adicionarCelula(linha, usuario.email_usuario);

        const administrador =
            Number(usuario.nivel_usuario) === 1;

        const ativo =
            Number(usuario.ativo_usuario) === 1;

        adicionarCelula(
            linha,
            administrador ? 'Administrador' : 'Operador'
        );

        adicionarCelula(
            linha,
            ativo ? 'Ativo' : 'Bloqueado'
        );

        const celulaAcoes = document.createElement('td');

        if (!administrador) {
            const botao = document.createElement('button');

            botao.type = 'button';
            botao.className = ativo
                ? 'btn btn-sm btn-outline-danger'
                : 'btn btn-sm btn-outline-success';

            botao.textContent = ativo
                ? 'Bloquear'
                : 'Reativar';

            botao.addEventListener('click', async () => {
                const texto = ativo
                    ? 'Bloquear este operador?'
                    : 'Reativar este operador?';

                if (!confirm(texto)) return;

                botao.disabled = true;

                const resultado =
                    await api.alterarSituacaoUsuario(
                        usuario.id_usuario,
                        ativo ? 0 : 1
                    );

                if (!resultado.ok) {
                    avisar(resultado.erro, true);
                    botao.disabled = false;
                    return;
                }

                avisar('Situação atualizada com sucesso.');
                await carregarUsuarios();
            });

            celulaAcoes.appendChild(botao);
        }

        linha.appendChild(celulaAcoes);
        corpoTabela.appendChild(linha);
    }
}

document.querySelector('#btnNovoUsuario')
    .addEventListener('click', () => {
        areaFormulario.hidden = false;
        document.querySelector('#novoNome').focus();
    });

document.querySelector('#btnCancelarNovo')
    .addEventListener('click', () => {
        formulario.reset();
        areaFormulario.hidden = true;
    });

document.querySelector('#btnListarUsuarios')
    .addEventListener('click', carregarUsuarios);

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const dados = {
        nome: document.querySelector('#novoNome').value,
        login: document.querySelector('#novoLogin').value,
        email: document.querySelector('#novoEmail').value,
        senha: document.querySelector('#novaSenhaConta').value
    };

    const botao = formulario.querySelector(
        'button[type="submit"]'
    );

    botao.disabled = true;

    try {
        const resposta = await api.criarUsuario(dados);

        if (!resposta.ok) {
            avisar(resposta.erro, true);
            return;
        }

        formulario.reset();
        areaFormulario.hidden = true;

        avisar('Operador cadastrado com sucesso.');
        await carregarUsuarios();
    } catch (erro) {
        console.error(erro);
        avisar('Erro de comunicação com o sistema.', true);
    } finally {
        botao.disabled = false;
    }
});

carregarUsuarios().catch((erro) => {
    console.error(erro);
    avisar('Não foi possível carregar os usuários.', true);
});
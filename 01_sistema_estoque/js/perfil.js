
document.addEventListener('DOMContentLoaded', () => {

    const formulario = document.querySelector('#formSenha');
    const mensagem = document.querySelector('#mensagemPerfil');

    if (!formulario || !mensagem) {
        console.error('Formulário ou área de mensagens não encontrado.');
        return;
    }

    function mostrarMensagem(texto, tipo = 'danger') {
        mensagem.textContent = texto;
        mensagem.className = `small mt-3 text-${tipo}`;
    }

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const atual = document.querySelector('#senhaAtual').value;
        const nova = document.querySelector('#senhaNova').value;
        const confirma = document.querySelector('#senhaConfirma').value;

        const botao = formulario.querySelector('button[type="submit"]');

        if (nova !== confirma) {
            mostrarMensagem('As novas senhas não coincidem.');
            return;
        }

        if (nova.length < 12 || nova.length > 128) {
            mostrarMensagem('A nova senha deve ter entre 12 e 128 caracteres.');
            return;
        }

        if (atual === nova) {
            mostrarMensagem('A nova senha deve ser diferente da senha atual.');
            return;
        }

        if (typeof window.estoqueAPI?.alterarSenhaPerfil !== 'function') {
            mostrarMensagem('Função alterarSenhaPerfil indisponível no preload.js.');
            console.error('API alterarSenhaPerfil não encontrada.');
            return;
        }

        botao.disabled = true;
        mostrarMensagem('Verificando e alterando a senha...', 'secondary');

        try {
            const resposta = await window.estoqueAPI.alterarSenhaPerfil(
                atual,
                nova
            );

            console.log('Resultado da operação:', resposta);

            if (!resposta?.ok) {
                mostrarMensagem(
                    resposta?.erro ||
                    resposta?.mensagem ||
                    'Não foi possível alterar a senha.'
                );
                return;
            }

            formulario.reset();

            mostrarMensagem(
                'Senha alterada com sucesso! Faça logout e entre novamente.',
                'success'
            );

        } catch (erro) {
            console.error('Falha ao alterar senha:', erro);

            mostrarMensagem(
                'Erro de comunicação. Verifique o terminal do Electron.'
            );

        } finally {
            botao.disabled = false;
        }
    });

});

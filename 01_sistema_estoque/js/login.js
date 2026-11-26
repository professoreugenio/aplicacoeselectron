const formulario = document.querySelector('#formLogin');
const mensagem = document.querySelector('#mensagemLogin');
const botao = document.querySelector('#btnEntrar');
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!formulario.reportValidity()) return;
  botao.disabled = true;
  mensagem.textContent = 'Verificando acesso...';
  try {
    const resposta = await window.estoqueAPI.login(
      document.querySelector('#login').value,
      document.querySelector('#senha').value
    );
    document.querySelector('#senha').value = '';
    if (!resposta?.ok) {
      mensagem.textContent = resposta?.mensagem || 'Acesso não autorizado.';
      return;
    }
    window.location.assign('sistema.html');
  } catch {
    mensagem.textContent = 'Não foi possível acessar o MySQL. Confira o servidor e .env.';
  } finally {
    botao.disabled = false;
  }
});

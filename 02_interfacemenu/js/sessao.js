// Executado em cada página interna, inclusive nas páginas de módulos.
(async function iniciarIdentificacao() {
  try {
    if (!window.estoqueAPI) throw new Error('API_INDISPONIVEL');
    const resposta = await window.estoqueAPI.sessao();
    const usuario = resposta?.usuario;
    if (!resposta.ok || !usuario) throw new Error('SEM_SESSAO');
    if (document.body.dataset.recurso === 'relatorios' && usuario.nivel !== 1) {
      window.location.replace('sistema.html');
      return;
    }
    document.querySelectorAll('[data-usuario-nome]').forEach(el => el.textContent = usuario.nome);
    document.querySelectorAll('[data-usuario-id]').forEach(el => el.textContent = String(usuario.id));
    document.querySelectorAll('[data-usuario-perfil]').forEach(el => el.textContent = usuario.perfil);
    document.querySelectorAll('[data-usuario-login]').forEach(el => el.textContent = usuario.login);
    document.querySelectorAll('[data-admin-somente]').forEach(el => {
      el.hidden = usuario.nivel !== 1;
    });
    // Sinaliza para o CRUD demonstrativo qual nível foi autenticado.
    window.dispatchEvent(new CustomEvent('estoque:sessao-pronta', { detail: usuario }));
  } catch {
    window.location.replace('index.html');
  }
})();

const sair = document.querySelector('[data-sair]');
if (sair) {
  sair.addEventListener('click', async () => {
    sair.disabled = true;
    try { await window.estoqueAPI.sair(); } finally {
      window.location.replace('index.html');
    }
  });
}

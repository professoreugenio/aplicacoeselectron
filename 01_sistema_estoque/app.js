const botoesMenu = document.querySelectorAll('[data-pagina]');
const paginas = document.querySelectorAll('.pagina');

function mostrarPagina(nomePagina) {
  const paginaDestino = document.querySelector(`#pagina-${nomePagina}`);
  if (!paginaDestino) return;

  paginas.forEach((pagina) => {
    pagina.hidden = pagina !== paginaDestino;
  });

  botoesMenu.forEach((botao) => {
    const selecionado = botao.dataset.pagina === nomePagina;
    botao.classList.toggle('ativo', selecionado);

    if (selecionado) {
      botao.setAttribute('aria-current', 'page');
    } else {
      botao.removeAttribute('aria-current');
    }
  });

  paginaDestino.querySelector('h1')?.focus();
}

botoesMenu.forEach((botao) => {
  botao.addEventListener('click', () => {
    mostrarPagina(botao.dataset.pagina);
  });
});

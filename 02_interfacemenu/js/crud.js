// CRUD didático: os dados existem somente na memória desta página.
// Ao sair ou atualizar, as alterações são perdidas. Não há autenticação nem MySQL.
const recurso = document.body.dataset.recurso;
const nomes = {
  produtos: { plural: 'Produtos', campo: 'Nome do produto', samples: ['Mouse USB', 'Teclado ABNT2', 'Monitor 21 polegadas'] },
  categorias: { plural: 'Categorias', campo: 'Nome da categoria', samples: ['Informática', 'Escritório'] },
  movimentacoes: { plural: 'Movimentações', campo: 'Descrição da movimentação', samples: ['Entrada: Mouse USB (5 unidades)', 'Saída: Teclado ABNT2 (2 unidades)'] },
  relatorios: { plural: 'Relatórios', campo: 'Nome do relatório', samples: ['Produtos cadastrados', 'Movimentações por período'] }
};
const configuracao = nomes[recurso];
if (!configuracao) throw new Error('Recurso desconhecido');
let proximoId = configuracao.samples.length + 1;
let registros = configuracao.samples.map((nome, i) => ({ id: i + 1, nome }));
let emEdicao = null;

const formulario = document.querySelector('#formCadastro');
const nomeInput = document.querySelector('#nomeRegistro');
const idInput = document.querySelector('#idRegistro');
const msg = document.querySelector('#mensagem');
const corpoTabela = document.querySelector('#registros');
const tituloForm = document.querySelector('#tituloFormulario');
const tituloCampo = document.querySelector('#rotuloNome');
const formArea = document.querySelector('#formArea');
const mostrar = document.querySelector('#btnListar');
const novo = document.querySelector('#btnNovo');
const cancelar = document.querySelector('#btnCancelar');

tituloCampo.textContent = configuracao.campo;

function avisar(texto) { msg.textContent = texto; }
function limpar() {
  formulario.reset(); emEdicao = null; idInput.value = '';
  tituloForm.textContent = 'Novo registro';
}
function mostrarFormulario() { formArea.hidden = false; nomeInput.focus(); }
function renderizar() {
  corpoTabela.replaceChildren();
  for (const item of registros) {
    const tr = document.createElement('tr');
    const id = document.createElement('td'); id.textContent = item.id;
    const texto = document.createElement('td'); texto.textContent = item.nome;
    const acoes = document.createElement('td');
    const editar = document.createElement('button');
    editar.type = 'button'; editar.className = 'btn btn-sm btn-outline-primary me-2';
    editar.textContent = 'Editar'; editar.addEventListener('click', () => editarRegistro(item.id));
    const excluir = document.createElement('button');
    excluir.type = 'button'; excluir.className = 'btn btn-sm btn-outline-danger';
    excluir.textContent = 'Excluir'; excluir.addEventListener('click', () => excluirRegistro(item.id));
    acoes.append(editar, excluir); tr.append(id, texto, acoes); corpoTabela.appendChild(tr);
  }
  if (!registros.length) {
    const tr = document.createElement('tr'); const td = document.createElement('td');
    td.colSpan = 3; td.className = 'text-secondary'; td.textContent = 'Nenhum registro nesta demonstração.';
    tr.appendChild(td); corpoTabela.appendChild(tr);
  }
}
function editarRegistro(id) {
  const registro = registros.find(item => item.id === id); if (!registro) return;
  emEdicao = id; idInput.value = id; nomeInput.value = registro.nome;
  tituloForm.textContent = `Editando #${id}`; mostrarFormulario(); avisar('Edite os dados e clique em Salvar.');
}
function excluirRegistro(id) {
  const registro = registros.find(item => item.id === id); if (!registro) return;
  if (!window.confirm(`Excluir "${registro.nome}" desta demonstração?`)) return;
  registros = registros.filter(item => item.id !== id);
  if (emEdicao === id) limpar(); renderizar(); avisar('Registro excluído apenas na memória.');
}
novo.addEventListener('click', () => { limpar(); mostrarFormulario(); avisar('Preencha o campo e salve.'); });
mostrar.addEventListener('click', () => { renderizar(); avisar('Lista atualizada.'); });
cancelar.addEventListener('click', () => { limpar(); formArea.hidden = true; avisar('Edição cancelada.'); });
formulario.addEventListener('submit', (evento) => {
  evento.preventDefault(); if (!formulario.reportValidity()) return;
  const nome = nomeInput.value.trim(); if (!nome) return avisar('Informe um nome válido.');
  if (emEdicao !== null) {
    const registro = registros.find(item => item.id === emEdicao);
    if (registro) registro.nome = nome;
    avisar('Registro alterado apenas na memória.');
  } else {
    registros.push({ id: proximoId++, nome });
    avisar('Novo registro incluído apenas na memória.');
  }
  limpar(); formArea.hidden = true; renderizar();
});
renderizar();

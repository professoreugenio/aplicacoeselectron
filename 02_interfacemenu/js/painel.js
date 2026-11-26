const statusBanco = document.querySelector('#statusBanco');
const avisoBanco = document.querySelector('#avisoBanco');
const btnTestar = document.querySelector('#btnTestarConexao');
const btnAtualizar = document.querySelector('#btnAtualizar');
const tabelaProdutos = document.querySelector('#tabelaProdutos');
const listaCategorias = document.querySelector('#listaCategorias');

function mostrarMensagem(texto, classe = 'secondary') {
  avisoBanco.className = `small text-${classe}`;
  avisoBanco.textContent = texto;
}

function marcarStatus(texto, classe) {
  statusBanco.className = `badge text-bg-${classe}`;
  statusBanco.textContent = texto;
}

async function consultar(chave) {
  return window.estoqueAPI[chave]();
}

function preencherTabela(produtos) {
  tabelaProdutos.replaceChildren();

  if (!produtos.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');

    td.colSpan = 4;
    td.textContent = 'Nenhum produto registrado no MySQL.';

    tr.append(td);
    tabelaProdutos.append(tr);
    return;
  }

  for (const p of produtos) {
    const tr = document.createElement('tr');

    for (const valor of [
      p.id,
      p.nome,
      p.categoria,
      p.estoque
    ]) {
      const td = document.createElement('td');
      td.textContent = String(valor);
      tr.append(td);
    }

    tabelaProdutos.append(tr);
  }
}

function preencherCategorias(categorias) {
  listaCategorias.replaceChildren();

  for (const c of categorias) {
    const li = document.createElement('li');

    li.className = 'list-group-item';
    li.textContent = c.nome;
    listaCategorias.append(li);
  }

  if (!categorias.length) {
    const li = document.createElement('li');

    li.className = 'list-group-item text-secondary';
    li.textContent = 'Nenhuma categoria cadastrada.';
    listaCategorias.append(li);
  }
}

async function atualizarPainel() {
  btnAtualizar.disabled = true;
  mostrarMensagem('Consultando registros do MySQL...');

  try {
    const [resumo, produtos, categorias] = await Promise.all([
      consultar('obterResumo'),
      consultar('obterProdutos'),
      consultar('obterCategorias')
    ]);

    if (!resumo.ok || !produtos.ok || !categorias.ok) {
      throw new Error('CONSULTA_FALHOU');
    }

    const indicadores = {
      totalProdutos: resumo.dados.produtos,
      totalCategorias: resumo.dados.categorias,
      totalEntradas: resumo.dados.entradas,
      totalSaidas: resumo.dados.saidas
    };

    for (const [id, valor] of Object.entries(indicadores)) {
      document.getElementById(id).textContent =
        String(valor);
    }

    preencherTabela(produtos.dados);
    preencherCategorias(categorias.dados);

    marcarStatus('MySQL conectado', 'success');
    mostrarMensagem(
      'Dados reais atualizados com sucesso.',
      'success'
    );
  } catch {
    marcarStatus('Conexão indisponível', 'danger');

    mostrarMensagem(
      'Não foi possível consultar. Confira servidor, permissões e .env.',
      'danger'
    );
  } finally {
    btnAtualizar.disabled = false;
  }
}

btnTestar.addEventListener('click', async () => {
  btnTestar.disabled = true;

  mostrarMensagem(
    'Testando conexão e registro do histórico...'
  );

  try {
    const resposta = await consultar('testarConexao');

    if (!resposta.ok) {
      throw new Error('CONEXAO_FALHOU');
    }

    marcarStatus('MySQL conectado', 'success');

    mostrarMensagem(
      resposta.dados.historico
        ? 'Conexão confirmada. Evento TESTE_CONEXAO registrado em historico_tb.'
        : 'Conexão confirmada. Não foi possível registrar o evento no histórico.',
      resposta.dados.historico ? 'success' : 'warning'
    );
  } catch {
    marcarStatus('Conexão indisponível', 'danger');

    mostrarMensagem(
      'Falha de conexão. Verifique o MySQL, o banco e o arquivo .env.',
      'danger'
    );
  } finally {
    btnTestar.disabled = false;
  }
});

btnAtualizar.addEventListener(
  'click',
  atualizarPainel
);

if (!window.estoqueAPI) {
  marcarStatus('API não disponível', 'danger');

  mostrarMensagem(
    'Execute pelo Electron; o navegador comum não carrega preload.js.',
    'danger'
  );
} else {
  atualizarPainel();
}
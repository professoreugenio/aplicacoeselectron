const { obterPool } = require('./conexao');

async function testarConexao() {
  const db = obterPool();

  await db.execute('SELECT 1 AS conectado');

  try {
    await db.execute(
      `INSERT INTO historico_tb
       (id_usuario, acao, descricao, entidade, resultado)
       VALUES (NULL, ?, ?, ?, ?)`,
      [
        'TESTE_CONEXAO',
        'Teste manual sem login autenticado',
        'sistema',
        'SUCESSO'
      ]
    );

    return {
      conectado: true,
      historico: true
    };
  } catch (erro) {
    console.error(
      'Falha ao registrar auditoria:',
      erro.code || erro.message
    );

    return {
      conectado: true,
      historico: false
    };
  }
}

async function obterResumo() {
  const db = obterPool();

  const [produtos] = await db.execute(
    'SELECT COUNT(*) AS total FROM produtos_tb'
  );

  const [categorias] = await db.execute(
    'SELECT COUNT(*) AS total FROM categorias_tb'
  );

  const [entradas] = await db.execute(
    'SELECT COUNT(*) AS total FROM movimentacoes_tb WHERE tipo_movimentacao = ?',
    ['ENTRADA']
  );

  const [saidas] = await db.execute(
    'SELECT COUNT(*) AS total FROM movimentacoes_tb WHERE tipo_movimentacao = ?',
    ['SAIDA']
  );

  return {
    produtos: Number(produtos[0].total),
    categorias: Number(categorias[0].total),
    entradas: Number(entradas[0].total),
    saidas: Number(saidas[0].total)
  };
}

async function obterProdutos() {
  const [rows] = await obterPool().execute(
    `SELECT
        p.id_produto,
        p.nome_produto,
        c.nome_categoria,
        p.estoque_atual
     FROM produtos_tb AS p
     INNER JOIN categorias_tb AS c
       ON p.id_categoria = c.id_categoria
     ORDER BY p.id_produto DESC
     LIMIT 8`
  );

  return rows.map(row => ({
    id: Number(row.id_produto),
    nome: String(row.nome_produto),
    categoria: String(row.nome_categoria),
    estoque: Number(row.estoque_atual)
  }));
}

async function obterCategorias() {
  const [rows] = await obterPool().execute(
    `SELECT id_categoria, nome_categoria
     FROM categorias_tb
     ORDER BY nome_categoria
     LIMIT 10`
  );

  return rows.map(row => ({
    id: Number(row.id_categoria),
    nome: String(row.nome_categoria)
  }));
}

module.exports = {
  testarConexao,
  obterResumo,
  obterProdutos,
  obterCategorias
};
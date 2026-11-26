const { ipcMain } = require('electron');
const path = require('node:path');
const { fileURLToPath } = require('node:url');
const consultas = require('../db/consultas');
const autenticacao = require('../auth/autenticacao');
const sessao = require('../auth/sessao');

function registrarHandlers(obterJanela) {
  function origem(evento) {
    const janela = obterJanela();
    if (!janela || evento.sender !== janela.webContents ||
        evento.senderFrame !== janela.webContents.mainFrame) throw new Error('ORIGEM_INVALIDA');
    const arquivo = fileURLToPath(evento.senderFrame.url);
    if (path.dirname(arquivo) !== path.join(__dirname, '..')) throw new Error('ORIGEM_INVALIDA');
    return path.basename(arquivo);
  }
  const protegidas = new Set([
    'sistema.html', 'produtos.html', 'categorias.html',
    'movimentacoes.html', 'relatorios.html'
  ]);
  async function atender(evento, paginas, funcao, requerAdmin = false) {
    try {
      const pagina = origem(evento);
      if (!paginas.includes(pagina)) throw new Error('PAGINA_INVALIDA');
      if (pagina !== 'index.html') {
        if (!sessao.obterSessao()) throw new Error('LOGIN_NECESSARIO');
        if (requerAdmin || pagina === 'relatorios.html') sessao.exigeAdministrador();
      }
      return await funcao();
    } catch (erro) {
      console.error('IPC:', erro.code || erro.message);
      return { ok: false, mensagem: 'Acesso não autorizado ou operação indisponível.' };
    }
  }
  ipcMain.handle('auth:login', (e, dados) => atender(e, ['index.html'],
    () => autenticacao.autenticar(dados?.login, dados?.senha)));
  ipcMain.handle('auth:sessao', (e) => atender(e, [...protegidas],
    async () => ({ ok: true, usuario: sessao.obterSessao() })));
  ipcMain.handle('auth:sair', (e) => atender(e, [...protegidas],
    () => autenticacao.sair()));
  const canal = (nome, funcao) => ipcMain.handle(nome, (e) => atender(e,
    ['sistema.html'], async () => ({ ok: true, dados: await funcao() })));
  canal('estoque:testar', consultas.testarConexao);
  canal('estoque:resumo', consultas.obterResumo);
  canal('estoque:produtos', consultas.obterProdutos);
  canal('estoque:categorias', consultas.obterCategorias);
}
module.exports = { registrarHandlers };

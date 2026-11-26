const { ipcMain } = require('electron');
const path = require('node:path');
const { fileURLToPath } = require('node:url');
const consultas = require('../db/consultas');
const autenticacao = require('../auth/autenticacao');
const sessao = require('../auth/sessao');
function registrarHandlers(obterJanela) {
  function origem(evento) {
    const janela = obterJanela();
    if (
      !janela ||
      evento.sender !== janela.webContents ||
      evento.senderFrame !== janela.webContents.mainFrame
    ) {
      throw new Error('ORIGEM_INVALIDA');
    }
    const arquivo = fileURLToPath(evento.senderFrame.url);
    if (path.dirname(arquivo) !== path.join(__dirname, '..')) {
      throw new Error('ORIGEM_INVALIDA');
    }
    return path.basename(arquivo);
  }
  // Páginas que exigem login
  const protegidas = new Set([
    'sistema.html',
    'produtos.html',
    'categorias.html',
    'movimentacoes.html',
    'relatorios.html',
    'usuarios.html',
    'perfil.html'
  ]);
  // Páginas que exigem nível de administrador
  const paginasAdmin = new Set([
    'relatorios.html',
    'usuarios.html'
  ]);
  async function atender(
    evento,
    paginas,
    funcao,
    requerAdmin = false
  ) {
    try {
      const pagina = origem(evento);
      if (!paginas.includes(pagina)) {
        throw new Error('PAGINA_INVALIDA');
      }
      if (pagina !== 'index.html') {
        if (!sessao.obterSessao()) {
          throw new Error('LOGIN_NECESSARIO');
        }
        if (requerAdmin || paginasAdmin.has(pagina)) {
          sessao.exigeAdministrador();
        }
      }
      return await funcao();
    } catch (erro) {
      console.error('IPC:', erro.code || erro.message);
      return {
        ok: false,
        mensagem: 'Acesso não autorizado ou operação indisponível.'
      };
    }
  }
  // AUTENTICAÇÃO
  ipcMain.handle(
    'auth:login',
    (evento, dados) =>
      atender(
        evento,
        ['index.html'],
        () => autenticacao.autenticar(
          dados?.login,
          dados?.senha
        )
      )
  );
  ipcMain.handle(
    'auth:sessao',
    (evento) =>
      atender(
        evento,
        [...protegidas],
        async () => ({
          ok: true,
          usuario: sessao.obterSessao()
        })
      )
  );
  ipcMain.handle(
    'auth:sair',
    (evento) =>
      atender(
        evento,
        [...protegidas],
        () => autenticacao.sair()
      )
  );
  // CONSULTAS DO SISTEMA DE ESTOQUE
  const canal = (nome, funcao) =>
    ipcMain.handle(
      nome,
      (evento) =>
        atender(
          evento,
          ['sistema.html'],
          async () => ({
            ok: true,
            dados: await funcao()
          })
        )
    );
  canal('estoque:testar', consultas.testarConexao);
  canal('estoque:resumo', consultas.obterResumo);
  canal('estoque:produtos', consultas.obterProdutos);
  canal('estoque:categorias', consultas.obterCategorias);
}
module.exports = { registrarHandlers };
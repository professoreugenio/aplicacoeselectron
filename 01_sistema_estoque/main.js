const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const { fileURLToPath } = require('node:url');

const { registrarHandlers } = require('./ipc/handlers');
const { obterSessao } = require('./auth/sessao');
const { fecharPool } = require('./db/conexao');

const {
  registrarAdminPerfilHandlers
} = require('./ipc/admin_perfil');

const {
  fecharPoolAdmin
} = require('./db/admin_perfil');

const paginasPermitidas = new Set([
  'index.html',
  'sistema.html',
  'produtos.html',
  'categorias.html',
  'movimentacoes.html',
  'relatorios.html',
  'usuarios.html',
  'perfil.html'
]);

const paginasAdmin = new Set([
  'categorias.html',
  'relatorios.html',
  'usuarios.html'
]);

let janelaPrincipal;

function criarJanela() {
  janelaPrincipal = new BrowserWindow({
    width: 1200,
    height: 780,
    minWidth: 850,
    minHeight: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  janelaPrincipal.webContents.setWindowOpenHandler(
    () => ({ action: 'deny' })
  );

  janelaPrincipal.webContents.on(
    'will-navigate',
    (evento, url) => {
      try {
        const arquivo = fileURLToPath(url);
        const nome = path.basename(arquivo);

        const permitido =
          path.dirname(arquivo) === __dirname &&
          paginasPermitidas.has(nome);

        const sessao = obterSessao();
        const autenticado = Boolean(sessao);
        const ehAdmin = Number(sessao?.nivel) === 1;

        const autorizado =
          permitido &&
          (
            nome === 'index.html' ||
            (
              autenticado &&
              (!paginasAdmin.has(nome) || ehAdmin)
            )
          );

        if (autorizado) return;
      } catch (erro) {
        console.error(
          '[NAVEGACAO]', erro.message
        );
      }

      evento.preventDefault();
    }
  );

  janelaPrincipal.webContents.on(
    'did-fail-load',
    (_evento, codigo, descricao, url, principal) => {
      if (principal) {
        console.error(
          '[ERRO AO CARREGAR]',
          codigo, descricao, url
        );
      }
    }
  );

  janelaPrincipal.loadFile(
    path.join(__dirname, 'index.html')
  );
}

app.whenReady().then(() => {
  registrarHandlers(() => janelaPrincipal);
  registrarAdminPerfilHandlers();
  criarJanela();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      criarJanela();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  void fecharPool();
  void fecharPoolAdmin();
});
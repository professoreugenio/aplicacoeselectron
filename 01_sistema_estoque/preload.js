const {
  contextBridge,
  ipcRenderer
} = require('electron');

contextBridge.exposeInMainWorld('estoqueAPI', {
  login: (login, senha) =>
    ipcRenderer.invoke('auth:login', { login, senha }),

  sessao: () =>
    ipcRenderer.invoke('auth:sessao'),

  sair: () =>
    ipcRenderer.invoke('auth:sair'),

  testarConexao: () =>
    ipcRenderer.invoke('estoque:testar'),

  obterResumo: () =>
    ipcRenderer.invoke('estoque:resumo'),

  obterProdutos: () =>
    ipcRenderer.invoke('estoque:produtos'),

  obterCategorias: () =>
    ipcRenderer.invoke('estoque:categorias'),

  listarUsuarios: () =>
    ipcRenderer.invoke('admin:usuarios:listar'),

  criarUsuario: (dados) =>
    ipcRenderer.invoke('admin:usuarios:criar', dados),

  alterarSituacaoUsuario: (id, ativo) =>
    ipcRenderer.invoke(
      'admin:usuarios:situacao',
      { id, ativo }
    ),

  alterarSenhaPerfil: (atual, nova) =>
    ipcRenderer.invoke(
      'perfil:alterarSenha',
      { atual, nova }
    )
});
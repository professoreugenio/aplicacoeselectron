const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('estoqueAPI', {
  login: (login, senha) => ipcRenderer.invoke('auth:login', { login, senha }),
  sessao: () => ipcRenderer.invoke('auth:sessao'),
  sair: () => ipcRenderer.invoke('auth:sair'),
  testarConexao: () => ipcRenderer.invoke('estoque:testar'),
  obterResumo: () => ipcRenderer.invoke('estoque:resumo'),
  obterProdutos: () => ipcRenderer.invoke('estoque:produtos'),
  obterCategorias: () => ipcRenderer.invoke('estoque:categorias')
});

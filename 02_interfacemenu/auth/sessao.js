const LIMITE_INATIVIDADE_MS = 30 * 60 * 1000;
let atual = null;

function iniciarSessao(usuario) {
  atual = {
    id: Number(usuario.id_usuario),
    nome: String(usuario.nome_usuario),
    login: String(usuario.login_usuario),
    nivel: Number(usuario.nivel_usuario),
    foto: String(usuario.foto_usuario || 'usuario.jpg'),
    ultimoUso: Date.now()
  };
  return obterSessao();
}
function obterSessao() {
  if (!atual) return null;
  if (Date.now() - atual.ultimoUso > LIMITE_INATIVIDADE_MS) {
    atual = null;
    return null;
  }
  atual.ultimoUso = Date.now();
  return { id: atual.id, nome: atual.nome, login: atual.login,
    nivel: atual.nivel, foto: atual.foto,
    perfil: atual.nivel === 1 ? 'Administrador' : 'Usuário' };
}
function encerrarSessao() { atual = null; }
function precisaLogin() { return Boolean(obterSessao()); }
function exigeAdministrador() {
  const usuario = obterSessao();
  if (!usuario || usuario.nivel !== 1) throw new Error('ACESSO_NEGADO');
  return usuario;
}
module.exports = { iniciarSessao, obterSessao, encerrarSessao, precisaLogin, exigeAdministrador };

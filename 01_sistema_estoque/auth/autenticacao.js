const { obterPool } = require('../db/conexao');
const { conferirSenha } = require('./senhas');
const sessao = require('./sessao');
const tentativas = new Map();
const JANELA = 60 * 1000;
const MAX_TENTATIVAS = 5;

async function registrarHistorico(id, acao, resultado, descricao) {
  try {
    await obterPool().execute(
      `INSERT INTO historico_tb
       (id_usuario, acao, descricao, entidade, resultado)
       VALUES (?, ?, ?, 'usuarios_tb', ?)`,
      [id, acao, descricao, resultado]
    );
  } catch (erro) {
    console.error('Falha de auditoria:', erro.code || erro.message);
  }
}

async function autenticar(login, senha) {
  if (typeof login !== 'string' || typeof senha !== 'string' ||
      !login.trim() || login.length > 60 || !senha || senha.length > 1024) {
    return { ok: false, mensagem: 'Informe usuário e senha válidos.' };
  }
  const nomeLogin = login.trim();
  const chave = nomeLogin.toLowerCase();
  const agora = Date.now();
  const estado = tentativas.get(chave) || { inicio: agora, total: 0 };
  if (agora - estado.inicio > JANELA) { estado.inicio = agora; estado.total = 0; }
  if (estado.total >= MAX_TENTATIVAS) {
    return { ok: false, mensagem: 'Muitas tentativas. Tente novamente em um minuto.' };
  }
  const [rows] = await obterPool().execute(
    `SELECT id_usuario, nome_usuario, login_usuario, senha_usuario,
            nivel_usuario, foto_usuario, ativo_usuario
       FROM usuarios_tb WHERE login_usuario = ? LIMIT 1`,
    [nomeLogin]
  );
  const usuario = rows[0];
  // Mesmo usuário inexistente executa scrypt, reduzindo diferenças de tempo.
  const dummy = 'scrypt$0123456789abcdef0123456789abcdef$' + '00'.repeat(64);
  const confere = await conferirSenha(senha, usuario ? usuario.senha_usuario : dummy);
  if (!usuario || !confere || Number(usuario.ativo_usuario) !== 1) {
    estado.total++;
    tentativas.set(chave, estado);
    await registrarHistorico(usuario ? Number(usuario.id_usuario) : null,
      'LOGIN_FALHA', 'FALHA', 'Falha de autenticação');
    return { ok: false, mensagem: 'Usuário ou senha inválidos.' };
  }
  tentativas.delete(chave);
  const perfil = sessao.iniciarSessao(usuario);
  await registrarHistorico(perfil.id, 'LOGIN_SUCESSO', 'SUCESSO', 'Acesso ao sistema');
  return { ok: true, usuario: perfil };
}

async function sair() {
  const usuario = sessao.obterSessao();
  sessao.encerrarSessao();
  if (usuario) await registrarHistorico(usuario.id, 'LOGOUT', 'SUCESSO', 'Saída do sistema');
  return { ok: true };
}
module.exports = { autenticar, sair, registrarHistorico };

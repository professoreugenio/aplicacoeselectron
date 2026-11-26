const mysql = require('mysql2/promise');
const { scrypt: scryptCallback, randomBytes } = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(scryptCallback);

async function main() {
  const { input, password } = await import('@inquirer/prompts');

  const host = await input({
    message: 'Host MySQL:',
    default: 'localhost'
  });

  const dbUser = await input({
    message: 'Usuário MySQL:',
    default: 'root'
  });

  const dbPassword = await password({
    message: 'Senha do MySQL:',
    mask: '*'
  });

  const conexao = await mysql.createConnection({
    host,
    user: dbUser,
    password: dbPassword,
    database: 'estoque_bd'
  });

  try {
    const contas = [
      { nivel: 1, rotulo: 'ADMINISTRADOR', login: 'admin' },
      { nivel: 0, rotulo: 'USUÁRIO COMUM', login: 'operador' }
    ];

    for (const conta of contas) {
      const nome = await input({
        message: `Nome do ${conta.rotulo}:`,
        required: true
      });

      const email = await input({
        message: `E-mail do ${conta.rotulo}:`,
        required: true
      });

      const senha = await password({
        message: `Senha forte do ${conta.rotulo} (12 caracteres ou mais):`,
        mask: '*',
        validate: v => v.length >= 12
          ? true
          : 'Use no mínimo 12 caracteres.'
      });

      const salt = randomBytes(16).toString('hex');

      const derivada = await scrypt(
        senha,
        Buffer.from(salt, 'hex'),
        64
      );

      const hash = `scrypt$${salt}$${derivada.toString('hex')}`;

      const [resultado] = await conexao.execute(
        `INSERT INTO usuarios_tb
         (nome_usuario, login_usuario, email_usuario,
          senha_usuario, nivel_usuario)
         VALUES (?, ?, ?, ?, ?)`,
        [nome, conta.login, email, hash, conta.nivel]
      );

      await conexao.execute(
        `INSERT INTO historico_tb
         (id_usuario, acao, descricao, entidade, id_registro)
         VALUES (?, 'USUARIO_CRIADO', ?, 'usuarios_tb', ?)`,
        [
          resultado.insertId,
          `Conta ${conta.login} criada no preparo inicial`,
          resultado.insertId
        ]
      );

      console.log(
        `Conta ${conta.login} criada com ID ${resultado.insertId}.`
      );
    }
  } finally {
    await conexao.end();
  }
}

main().catch(erro => {
  console.error(
    'Não foi possível cadastrar:',
    erro.code || erro.message
  );
  process.exitCode = 1;
});
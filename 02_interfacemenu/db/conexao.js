const path = require('node:path');
const mysql = require('mysql2/promise');

require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
  quiet: true
});

let pool;

function obterPool() {
  if (!pool) {
    if (!process.env.DB_USER || !process.env.DB_NAME) {
      throw new Error('CONFIGURACAO_AUSENTE');
    }

    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      connectTimeout: 5000,
      multipleStatements: false
    });
  }

  return pool;
}

async function fecharPool() {
  if (pool) {
    const atual = pool;
    pool = null;
    await atual.end();
  }
}

module.exports = {
  obterPool,
  fecharPool
};
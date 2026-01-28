const mysql = require('mysql2');
require('dotenv').config();

// Configuração da ligação (Pool)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306, // AQUI ESTÁ O SEGREDO: Lê a porta 3307 do .env
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Converter para Promises para usar 'await' no resto do projeto
const promisePool = pool.promise();

// Mensagem no terminal para confirmar que apanhou a porta certa
console.log(`🔌 A tentar ligar ao MySQL na porta: ${process.env.DB_PORT || 3306}`);

module.exports = promisePool;
ssl: {
  rejectUnauthorized: false
}

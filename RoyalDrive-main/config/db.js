const mysql = require('mysql2');
require('dotenv').config();

// Configuração da ligação (Pool)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 21836, // Usa a porta do Aiven
    ssl: {
        rejectUnauthorized: false // OBRIGATÓRIO para o Aiven funcionar no Render
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Converter para Promises para usar 'await'
const promisePool = pool.promise();

// Log para controlo
console.log(`🔌 Tentativa de ligação ao MySQL: ${process.env.DB_HOST}:${process.env.DB_PORT}`);

module.exports = promisePool;

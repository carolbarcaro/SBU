const mysql = require('mysql2/promise');

// Configuração da conexão
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123123', // coloque a senha se houver
  database: 'biblioteca_universitaria',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;

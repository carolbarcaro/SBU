const mysql = require('mysql2/promise');


const pool = mysql.createPool({
  host: '172.16.12.14',
  user: 'BD24022522',
  password: 'Nqibf2', 
  database: 'biblioteca_universitaria',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;

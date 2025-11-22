const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Belinha18-18',
  database: 'biblioteca_universitaria',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
<<<<<<< HEAD
=======

// . . .
>>>>>>> 43c8cca2512c144ca3e18f1d655de49d3bd7c76c

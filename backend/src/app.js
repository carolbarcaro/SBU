const pool = require('./db');

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('Conexão com MySQL bem-sucedida:', rows[0].result);
  } catch (error) {
    console.error('Erro ao conectar ao MySQL:', error);
  }
}

testConnection();

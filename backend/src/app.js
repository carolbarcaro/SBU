const express = require('express');
const cors = require('cors');
const pool = require('./db');
const alunoRoutes = require('./routes/alunoRoutes');
const livroRoutes = require('./routes/livroRoutes');
const retiradaRoutes = require('./routes/retiradaRoutes');
const devolucaoRoutes = require('./routes/devolucaoRoutes');

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// rota de teste
app.get('/api', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS hora_atual');
    res.json({
      message: 'Conexão bem-sucedida com o MySQL',
      hora_atual: rows[0].hora_atual
    });
  } catch (error) {
    console.error('Erro na rota /api:', error);
    res.status(500).json({ error: 'Erro ao conectar ao banco' });
  }
});

// rotas
app.use('/api/alunos', alunoRoutes);
app.use('/api/livros', livroRoutes);
app.use('/api/retirada', retiradaRoutes);
app.use('/api/devolucao', devolucaoRoutes);


module.exports = app;

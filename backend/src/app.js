const express = require('express');
const cors = require('cors');
const pool = require('./db');
const alunoRoutes = require('./routes/alunoRoutes'); // 👈 esse caminho é fundamental
const livroRoutes = require('./routes/livroRoutes'); // importando as rotas de livro, que estão no arquivo livroRoutes.js

const app = express();
app.use(cors());
app.use(express.json());

// rota principal de teste
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

// rotas de alunos
app.use('/api/alunos', alunoRoutes);

app.use('/api/livros', livroRoutes); // configurando o app para usar as rotas de livro, com o endpoint /api/livros

// iniciando o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});

module.exports = app;


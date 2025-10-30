const express = require('express');
const pool = require('../db');
const router = express.Router();

//alunoRoutes
// Listar todos os alunos
router.get('/', async (req, res) => {
  try {
    console.log('caminho de aluno encontrado!');
    const [rows] = await pool.query('SELECT * FROM aluno');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
});

// rota pra listar alunos
router.get("/alunos", async (req, res) => {
  const alunos = await prisma.aluno.findMany();
  res.json(alunos);
});

router.post("/cadastro_aluno", async (req, res) => {
  try {
    const { nome, ra, email, telefone } = req.body;

    if (!nome || !ra || !email || !telefone) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    const aluno = await prisma.aluno.create({
      data: { nome, ra, email, telefone },
    });

    res.status(201).json(aluno);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao cadastrar aluno" });
  }
});

module.exports = router;

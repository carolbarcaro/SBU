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

module.exports = router;

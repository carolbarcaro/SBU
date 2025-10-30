const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM aluno');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
});

// ✅ Cadastrar novo aluno
router.post('/', async (req, res) => {
  try {
    const { nome, ra, email, telefone } = req.body;

    if (!nome || !ra || !email || !telefone) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    await pool.query(
      'INSERT INTO aluno (nome, ra, email, telefone) VALUES (?, ?, ?, ?)',
      [nome, ra, email, telefone]
    );

    res.status(201).json({ message: 'Aluno cadastrado com sucesso!' });
  } catch (err) {
    console.error('Erro ao cadastrar aluno:', err);
    res.status(500).json({ error: 'Erro ao cadastrar aluno' });
  }
});

module.exports = router;

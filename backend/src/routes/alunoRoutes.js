const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET /api/alunos  -> listar todos os alunos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM aluno');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
});

// POST /api/alunos  -> cadastrar novo aluno
router.post('/', async (req, res) => {
  try {
    const { nome, ra, email, telefone } = req.body;

    // validação simples
    if (!nome || !ra || !email || !telefone) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const sql = 'INSERT INTO aluno (nome, ra, email, telefone) VALUES (?, ?, ?, ?)';
    await pool.query(sql, [nome, ra, email, telefone]);

    res.status(201).json({ message: 'Aluno cadastrado com sucesso!' });

  } catch (err) {
    // tratamento específico para RA duplicado
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Esse RA já está cadastrado!' });
    }

    console.error('Erro ao cadastrar aluno:', err);
    res.status(500).json({ error: 'Erro ao cadastrar aluno.' });
  }
});

// POST /api/alunos/login  -> login do aluno pelo RA
router.post('/login', async (req, res) => {
  try {
    const { ra } = req.body;

    if (!ra) {
      return res.status(400).json({ error: 'Informe o RA.' });
    }

    const sql = 'SELECT * FROM aluno WHERE ra = ?';
    const [rows] = await pool.query(sql, [ra]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'RA não encontrado. Verifique os dados.' });
    }

    const aluno = rows[0];

    return res.status(200).json({
      message: 'Login realizado com sucesso!',
      aluno
    });

  } catch (error) {
    console.error('Erro ao fazer login do aluno:', error);
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

module.exports = router;

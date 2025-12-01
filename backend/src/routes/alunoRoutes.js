const express = require('express');
const pool = require('../db');
const router = express.Router();

// converte do banco (INICIANTE/REGULAR/ATIVO/EXTREMO)

function mapEnumToNivel(enumVal) {
  switch ((enumVal || "").toUpperCase()) {
    case 'INICIANTE': return 'Leitor Iniciante';
    case 'REGULAR':   return 'Leitor Regular';
    case 'ATIVO':     return 'Leitor Ativo';
    case 'EXTREMO':   return 'Leitor Extremo';
    default: return 'Leitor Iniciante';
  }
}

// listar todos os alunos

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM aluno');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
});

// cadastrar novo aluno

router.post('/', async (req, res) => {
  try {
    const { nome, ra, email, telefone } = req.body;

    if (!nome || !ra) {
      return res.status(400).json({ error: 'Nome e RA são obrigatórios.' });
    }

    const sql = 'INSERT INTO aluno (ra, nome, email, telefone) VALUES (?, ?, ?, ?)';
    await pool.query(sql, [ra, nome, email || null, telefone || null]);

    res.status(201).json({ message: 'Aluno cadastrado com sucesso!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Esse RA já está cadastrado!' });
    }
    console.error('Erro ao cadastrar aluno:', err);
    res.status(500).json({ error: 'Erro ao cadastrar aluno.' });
  }
});

// login do aluno pelo RA

router.post('/login', async (req, res) => {
  try {
    const { ra } = req.body;

    if (!ra) {
      return res.status(400).json({ error: 'Informe o RA.' });
    }

    const sql = 'SELECT ra, nome, email, telefone FROM aluno WHERE ra = ?';
    const [rows] = await pool.query(sql, [ra]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'RA não encontrado. Verifique os dados.' });
    }

    // retorna os dados do aluno

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

/*
 * classificacao do aluno
 * pega da tabela 'leituras' (campo qtd_livros e pontuacao)
 *  Retorna total (qtd_livros)
 */

router.get('/classificacao/:ra', async (req, res) => {
  const { ra } = req.params;

  try {
    // busca no leituras
    const [rows] = await pool.query(
      'SELECT qtd_livros, pontuacao FROM leituras WHERE id_aluno = ?',
      [ra]
    );

    // se não encontrar registro de leituras, retorna zero e nível iniciante
    if (rows.length === 0) {
      return res.json({ total: 0, nivel: mapEnumToNivel('INICIANTE') });
    }

    const { qtd_livros: total, pontuacao } = rows[0];
    return res.json({ total: total || 0, nivel: mapEnumToNivel(pontuacao) });
  } catch (error) {
    console.error('Erro ao buscar classificacao:', error);
    res.status(500).json({ error: 'Erro ao buscar classificação.' });
  }
});

 // se não existir registro, retorna 0
router.get('/pontuacao/:ra', async (req, res) => {
  const { ra } = req.params;

  try {
    const [rows] = await pool.query(
      'SELECT qtd_livros FROM leituras WHERE id_aluno = ?',
      [ra]
    );

    const qtd = rows.length > 0 ? (rows[0].qtd_livros || 0) : 0;
    const pontos = qtd * 10;
    return res.json({ total: pontos });
  } catch (error) {
    console.error('Erro ao buscar pontuacao:', error);
    res.status(500).json({ error: 'Erro ao buscar pontuação.' });
  }
});

// lista os livros lidos pelo aluno, pra mostar na listagem do front

router.get('/livros-lidos/:ra', async (req, res) => {
  const { ra } = req.params;

  try {
    const sql = `
      SELECT l.id_livro, l.titulo, d.data_devolucao
      FROM devolucao d
      JOIN livro l ON l.id_livro = d.id_livro
      WHERE d.ra = ?
        AND d.data_devolucao >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      ORDER BY d.data_devolucao DESC
    `;
    const [rows] = await pool.query(sql, [ra]);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar livros lidos:', error);
    res.status(500).json({ error: 'Erro ao buscar livros lidos.' });
  }
});


router.get("/leituras", async (req, res) => {
  try {
    const sql = `
      SELECT 
        l.id_aluno,
        a.nome AS nome_aluno,
        l.qtd_livros,
        l.pontuacao
      FROM leituras l
      JOIN aluno a ON a.ra = l.id_aluno
    `;

    const [rows] = await pool.query(sql);

    res.json(rows);
  } catch (error) {
    console.error('Erro ao fazer login do aluno:', error);
    res.status(500).json({ error: 'Erro ao fazer login.' });
    console.error("Erro ao fazer login do aluno:", error);
    res.status(500).json({ error: "Erro ao fazer login." });
    console.error("Erro ao buscar leituras:", error);
    res.status(500).json({ error: "Erro ao buscar leituras." });
  }
});

module.exports = router;

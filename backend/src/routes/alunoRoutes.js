const express = require("express");
const pool = require("../db");
const router = express.Router();

/**
 * Helper para transformar o enum da tabela 'leituras' em texto amigável
 */
function nivelTexto(enumValue) {
  switch ((enumValue || "").toUpperCase()) {
    case "INICIANTE":
      return "Leitor Iniciante";
    case "REGULAR":
      return "Leitor Regular";
    case "ATIVO":
      return "Leitor Ativo";
    case "EXTREMO":
      return "Leitor Extremo";
    default:
      return "Leitor Iniciante";
  }
}

/* ============================
   Rotas CRUD / Autenticação
   ============================ */

// GET /api/alunos  -> listar todos os alunos
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM aluno");
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    res.status(500).json({ error: "Erro ao buscar alunos" });
  }
});

// POST /api/alunos  -> cadastrar novo aluno
router.post("/", async (req, res) => {
  try {
    const { nome, ra, email, telefone } = req.body;

    // validação simples
    if (!nome || !ra || !email || !telefone) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    const sql = "INSERT INTO aluno (ra, nome, email, telefone) VALUES (?, ?, ?, ?)";
    await pool.query(sql, [ra, nome, email, telefone]);

    res.status(201).json({ message: "Aluno cadastrado com sucesso!" });
  } catch (err) {
    // tratamento específico para RA duplicado
    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Esse RA já está cadastrado!" });
    }

    console.error("Erro ao cadastrar aluno:", err);
    res.status(500).json({ error: "Erro ao cadastrar aluno." });
  }
});

// POST /api/alunos/login  -> login do aluno pelo RA
router.post("/login", async (req, res) => {
  try {
    const { ra } = req.body;

    if (!ra) {
      return res.status(400).json({ error: "Informe o RA." });
    }

    const sql = "SELECT * FROM aluno WHERE ra = ?";
    const [rows] = await pool.query(sql, [ra]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "RA não encontrado. Verifique os dados." });
    }

    const aluno = rows[0];

    return res.status(200).json({
      message: "Login realizado com sucesso!",
      aluno,
    });
  } catch (error) {
    console.error("Erro ao fazer login do aluno:", error);
    res.status(500).json({ error: "Erro ao fazer login." });
  }
});

/* ============================
   Leitura / Pontuação / Nível
   ============================ */

/**
 * GET /api/alunos/leituras
 * Lista todos os registros da tabela 'leituras' com nome do aluno
 */
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
    console.error("Erro ao buscar leituras:", error);
    res.status(500).json({ error: "Erro ao buscar leituras." });
  }
});

/**
 * GET /api/alunos/classificacao/:ra
 * Retorna total de livros (preferencialmente da tabela 'leituras') e nível amigável.
 * Fallback: conta na tabela 'devolucao' (últimos 6 meses) caso não exista em 'leituras'
 */
router.get("/classificacao/:ra", async (req, res) => {
  const { ra } = req.params;

  if (!ra) {
    return res.status(400).json({ error: "Informe o RA." });
  }

  try {
    // tenta buscar na tabela leituras
    const sql = `SELECT qtd_livros, pontuacao FROM leituras WHERE id_aluno = ?`;
    const [rows] = await pool.query(sql, [ra]);

    if (rows.length > 0) {
      const qtd = Number(rows[0].qtd_livros || 0);
      return res.json({ total: qtd, nivel: nivelTexto(rows[0].pontuacao), fonte: "leituras" });
    }

    // fallback: conta na tabela devolucao (últimos 6 meses)
    const sqlFb = `
      SELECT COUNT(*) AS total
      FROM devolucao
      WHERE ra = ?
      AND data_devolucao >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    `;
    const [fb] = await pool.query(sqlFb, [ra]);
    const total = Number(fb[0].total || 0);

    let nivel;
    if (total <= 5) nivel = "Leitor Iniciante";
    else if (total <= 10) nivel = "Leitor Regular";
    else if (total <= 20) nivel = "Leitor Ativo";
    else nivel = "Leitor Extremo";

    return res.json({ total, nivel, fonte: "devolucao" });
  } catch (error) {
    console.error("Erro ao calcular classificação:", error);
    return res.status(500).json({ error: "Erro ao calcular classificação." });
  }
});

/**
 * GET /api/alunos/pontuacao/:ra
 * Retorna pontos (qtd_livros * 10). Prefere 'leituras', senão fallback para 'devolucao' (últimos 6 meses).
 */
router.get("/pontuacao/:ra", async (req, res) => {
  const { ra } = req.params;

  if (!ra) {
    return res.status(400).json({ error: "Informe o RA." });
  }

  try {
    // tenta ler de leituras
    const sql = `SELECT qtd_livros, pontuacao FROM leituras WHERE id_aluno = ?`;
    const [rows] = await pool.query(sql, [ra]);

    if (rows.length > 0) {
      const qtd = Number(rows[0].qtd_livros || 0);
      const pontos = qtd * 10;
      return res.json({ total: pontos, qtd_livros: qtd, nivel: nivelTexto(rows[0].pontuacao), fonte: "leituras" });
    }

    // fallback: conta na tabela devolucao (últimos 6 meses)
    const sqlFb = `
      SELECT COUNT(*) * 10 AS total, COUNT(*) AS qtd
      FROM devolucao
      WHERE ra = ?
      AND data_devolucao >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    `;
    const [fb] = await pool.query(sqlFb, [ra]);
    const total = Number(fb[0].total || 0);
    const qtd = Number(fb[0].qtd || 0);

    let nivel;
    if (qtd <= 5) nivel = "Leitor Iniciante";
    else if (qtd <= 10) nivel = "Leitor Regular";
    else if (qtd <= 20) nivel = "Leitor Ativo";
    else nivel = "Leitor Extremo";

    return res.json({ total, qtd_livros: qtd, nivel, fonte: "devolucao" });
  } catch (error) {
    console.error("Erro ao buscar pontuação:", error);
    return res.status(500).json({ error: "Erro ao buscar pontuação." });
  }
});

/**
 * GET /api/alunos/livros-lidos/:ra
 * Retorna títulos e datas/hora de devolução dos últimos 6 meses (detalhe vindo de 'devolucao' + 'livro')
 */
router.get("/livros-lidos/:ra", async (req, res) => {
  const { ra } = req.params;

  if (!ra) {
    return res.status(400).json({ error: "Informe o RA." });
  }

  try {
    const sql = `
      SELECT l.titulo, d.data_devolucao, d.horario_devolucao
      FROM devolucao d
      JOIN livro l ON l.id_livro = d.id_livro
      WHERE d.ra = ?
      AND d.data_devolucao >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      ORDER BY d.data_devolucao DESC, d.horario_devolucao DESC
    `;
    const [rows] = await pool.query(sql, [ra]);
    return res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar livros lidos:", error);
    return res.status(500).json({ error: "Erro ao buscar livros lidos." });
  }
});

/**
 * POST /api/alunos/recalcular-leitura/:ra
 * Recalcula (upsert) o registro em 'leituras' para o RA informado usando devolucoes dos últimos 6 meses.
 * Útil para migração/manual/forçar atualização.
 */
router.post("/recalcular-leitura/:ra", async (req, res) => {
  const { ra } = req.params;

  if (!ra) {
    return res.status(400).json({ error: "Informe o RA." });
  }

  try {
    const sqlCount = `
      SELECT COUNT(*) AS total
      FROM devolucao
      WHERE ra = ?
      AND data_devolucao >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    `;
    const [countRows] = await pool.query(sqlCount, [ra]);
    const total = Number(countRows[0].total || 0);

    let pont;
    if (total <= 5) pont = "INICIANTE";
    else if (total <= 10) pont = "REGULAR";
    else if (total <= 20) pont = "ATIVO";
    else pont = "EXTREMO";

    const sqlUpsert = `
      INSERT INTO leituras (id_aluno, qtd_livros, pontuacao)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE qtd_livros = VALUES(qtd_livros), pontuacao = VALUES(pontuacao)
    `;
    await pool.query(sqlUpsert, [ra, total, pont]);

    return res.json({ id_aluno: ra, qtd_livros: total, pontuacao: pont });
  } catch (error) {
    console.error("Erro ao recalcular leituras:", error);
    return res.status(500).json({ error: "Erro ao recalcular leituras." });
  }
});

module.exports = router;

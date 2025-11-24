const express = require("express");
const router = express.Router();
const pool = require("../db");

// listar todos os livros
router.get("/livros", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id_livro, titulo, codigo, ano, editora, situacao FROM livro"
        );

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao listar livros." });
    }
});

//listar livros disponiveis
router.get("/livros/disponiveis", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM livro WHERE situacao = 'DISPONIVEL'"
        );

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao listar livros disponíveis." });
    }
});

//listar livros emprestados
router.get("/livros/emprestados", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM livro WHERE situacao = 'EMPRESTADO'"
        );

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao listar livros emprestados." });
    }
});

//listar emprestimos feitos
router.get("/emprestimos", async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT e.id_emprestimo, e.data_emprestimo, e.horario_emprestimo,
                    e.data_devolucao, e.horario_devolucao,
                    l.titulo, l.codigo,
                    a.nome AS aluno, a.ra
             FROM emprestimo e
             JOIN livro l ON e.id_livro = l.id_livro
             JOIN aluno a ON e.ra = a.ra
             ORDER BY e.id_emprestimo DESC`
        );

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao listar empréstimos." });
    }
});

//listar devoluções
router.get("/devolucoes", async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT d.id_devolucao, d.data_devolucao, d.horario_devolucao,
                    l.titulo, l.codigo,
                    a.nome AS aluno, a.ra
             FROM devolucao d
             JOIN livro l ON d.id_livro = l.id_livro
             JOIN aluno a ON d.ra = a.ra
             ORDER BY d.id_devolucao DESC`
        );

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao listar devoluções." });
    }
});

module.exports = router;

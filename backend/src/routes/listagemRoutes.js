const express = require('express');
const router = express.Router();
const pool = require('../db');

//listagem de todos os livros
router.get('/', async (req, res) => {
    try {
        const [livros] = await pool.query(
            'SELECT id, titulo, codigo, ano, editora, disponivel FROM livro'
        );

        res.status(200).json(livros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao listar livros." });
    }
});

//listagem de livros disponíveis
router.get('/disponiveis', async (req, res) => {
    try {
        const [livros] = await pool.query(
            'SELECT id, titulo, codigo, ano, editora FROM livro WHERE disponivel = 1'
        );

        res.status(200).json(livros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao buscar livros disponíveis." });
    }
});

//listagem de livros não devolvidos
router.get('/emprestados', async (req, res) => {
    try {
        const [livros] = await pool.query(
            `SELECT l.id, l.titulo, l.codigo, l.editora, l.ano
             FROM livro l
             JOIN retirada r ON r.id_livro = l.id
             WHERE r.data_devolucao IS NULL`
        );

        res.status(200).json(livros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao listar livros emprestados." });
    }
});

//listagem de livros devolvidos
router.get('/devolvidos', async (req, res) => {
    try {
        const [livros] = await pool.query(
            `SELECT l.id, l.titulo, l.codigo, l.editora, l.ano
             FROM livro l
             JOIN retirada r ON r.id_livro = l.id
             WHERE r.data_devolucao IS NOT NULL`
        );

        res.status(200).json(livros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao listar livros devolvidos." });
    }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const pool = require("../db");

// listar todos os livros
router.get("/listarlivros", async (req, res) => {
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

module.exports = router;

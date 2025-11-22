const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/retiradaLivro', async (req, res) => {
    try {
        const { codigo, ra } = req.body;

        if (!ra || ra.length !== 8) {
            return res.status(400).json({ erro: "RA inválido. O RA deve ter exatamente 8 caracteres!" });
        }

        // aluno
        const [alunoResult] = await pool.query("SELECT * FROM aluno WHERE ra = ?", [ra]);
        if (alunoResult.length === 0) {
            return res.status(404).json({ erro: "Aluno não encontrado!" });
        }

        // livro
        const [livroResult] = await pool.query(
            "SELECT id_livro, situacao FROM livro WHERE codigo = ?",
            [codigo]
        );

        if (livroResult.length === 0) {
            return res.status(404).json({ erro: "Livro não encontrado!" });
        }

        const livro = livroResult[0];

        if (livro.situacao !== "DISPONIVEL") {
            return res.status(400).json({ erro: "Este livro já está emprestado!" });
        }

        // registrar emprestimo
        const [insert] = await pool.query(
            `INSERT INTO emprestimo (id_livro, ra, data_emprestimo, horario_emprestimo)
             VALUES (?, ?, CURDATE(), CURTIME())`,
            [livro.id_livro, ra]
        );

        // atualizar o estado
        await pool.query(
            "UPDATE livro SET situacao = 'EMPRESTADO' WHERE id_livro = ?",
            [livro.id_livro]
        );

        return res.status(201).json({
            mensagem: "Retirada realizada com sucesso!",
            id_emprestimo: insert.insertId
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: "Erro no servidor." });
    }
});

module.exports = router;

const express = require('express'); // framework para criar rotas, APIs e servidores de forma simples
const router = express.Router(); // gerenciador de rotas do express
const pool = require('../db'); // pool de conexões com o MySQL (mysql2/promise)

// rota para exibir o relatório de livros
// /relatorio é o endpoint que o front vai chamar para buscar todos os livros cadastrados
router.get('/relatorio1', async (req, res) => { 
    try {
        const [livros] = await pool.query(
            'SELECT id_livro, titulo, codigo, ano, editora, situacao FROM livro'
        ); 
        // SELECT busca todos os livros da tabela livro
        // o pool.query retorna um array onde o primeiro item é o resultado da query

        if (livros.length === 0) {
            return res.status(404).json({ 
                message: "Nenhum livro encontrado no sistema.",
                totalLivros: 0,
                livros: []
            });
        }

        res.status(200).json({
            totalLivros: livros.length, // essa linha faz com que exiba a qtd de livros cadastrados no front
            livros: livros              
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: "Erro ao gerar o relatório. Tente novamente mais tarde.",
            totalLivros: 0
        });
    }
});

module.exports = router; // exporta o router para ser usado no app.js

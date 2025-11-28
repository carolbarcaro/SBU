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

router.get('/relatorio2', async (req, res) => { 
    try {
        console.log('Tentando buscar livros em atraso...');
        
        const query = `
            SELECT l.id_livro, l.titulo, l.codigo, l.ano, l.editora, l.situacao, 
                   e.data_emprestimo, e.ra, a.nome as nome_aluno, 
                   DATEDIFF(CURDATE(), e.data_emprestimo) as dias_em_atraso 
            FROM livro l 
            INNER JOIN emprestimo e ON l.id_livro = e.id_livro 
            INNER JOIN aluno a ON e.ra = a.ra 
            WHERE l.situacao = 'EMPRESTADO' 
            AND e.data_devolucao IS NULL 
            AND DATEDIFF(CURDATE(), e.data_emprestimo) > 3 
            ORDER BY dias_em_atraso DESC
        `;
        
        const [livros] = await pool.query(query);
        console.log(`Encontrados ${livros.length} livros em atraso`);

        res.status(200).json({
            totalLivros: livros.length,
            livros: livros              
        });

    } catch (error) {
        console.error('Erro no relatorio2:', error);
        res.status(500).json({ 
            message: "Erro ao gerar o relatório.",
            totalLivros: 0,
            livros: []
        });
    }
});

router.get('/relatorio3', async (req, res) => { 
    try {
        const [livros] = await pool.query(
            'SELECT l.id_livro, l.titulo, l.codigo, l.situacao, e.data_emprestimo, d.data_devolucao, e.ra, a.nome as nome_aluno FROM livro l INNER JOIN emprestimo e ON l.id_livro = e.id_livro INNER JOIN aluno a ON e.ra = a.ra INNER JOIN devolucao d ON e.id_emprestimo = d.id_emprestimo WHERE e.data_devolucao IS NOT NULL ORDER BY d.data_devolucao DESC, d.horario_devolucao DESC;'
        ); 

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

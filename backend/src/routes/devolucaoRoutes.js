const express = require("express");
const router = express.Router();
const pool = require("../db");

// ROTA DE DEVOLUÇÃO DE LIVRO
router.post("/devolucaoLivro", async (req, res) => {
  try {
    const { codigo, ra } = req.body;

    // validação do RA
    if (!ra || ra.length !== 8) {
      return res.status(400).json({
        erro: "RA inválido. O RA deve conter exatamente 8 caracteres!",
      });
    }

    // verifica se o aluno existe
    const [alunoResult] = await pool.query("SELECT * FROM aluno WHERE ra = ?", [
      ra,
    ]);

    if (alunoResult.length === 0) {
      return res.status(404).json({
        erro: "Aluno não encontrado!",
      });
    }

    // verifica se o livro existe
    const [livroResult] = await pool.query(
      "SELECT id_livro, situacao FROM livro WHERE codigo = ?",
      [codigo]
    );

    if (livroResult.length === 0) {
      return res.status(404).json({
        erro: "Livro não encontrado!",
      });
    }

    const livro = livroResult[0];

    // se está disponível, não há o que devolver
    if (livro.situacao === "DISPONIVEL") {
      return res.status(400).json({
        erro: "Este livro já está disponível. Não existe devolução pendente!",
      });
    }

    // busca o empréstimo (ainda não devolvido)
    const [emprestimoResult] = await pool.query(
      `SELECT id_emprestimo, ra 
       FROM emprestimo
       WHERE id_livro = ? AND data_devolucao IS NULL
       ORDER BY id_emprestimo DESC`,
      [livro.id_livro]
    );

    if (emprestimoResult.length === 0) {
      return res.status(400).json({
        erro: "Nenhum empréstimo ativo encontrado para este livro!",
      });
    }

    const emprestimo = emprestimoResult[0];

    // verifica se o aluno tentando devolver é o mesmo do empréstimo
    if (emprestimo.ra !== ra) {
      return res.status(403).json({
        erro: "Este livro foi emprestado para outro RA!",
      });
    }

    // registra a devolução na tabela devolucao
    const [insertDevolucao] = await pool.query(
      `INSERT INTO devolucao 
       (id_livro, ra, data_devolucao, horario_devolucao, id_emprestimo)
       VALUES (?, ?, CURDATE(), CURTIME(), ?)`,
      [livro.id_livro, ra, emprestimo.id_emprestimo]
    );

    // atualiza o empréstimo com a data de devolução
    await pool.query(
      `UPDATE emprestimo 
       SET data_devolucao = CURDATE(),
           horario_devolucao = CURTIME()
       WHERE id_emprestimo = ?`,
      [emprestimo.id_emprestimo]
    );

    // marca o livro como disponível novamente
    await pool.query(
      "UPDATE livro SET situacao = 'DISPONIVEL' WHERE id_livro = ?",
      [livro.id_livro]
    );

    try {
      
      // se já existe na tabela leitura um registro desse alunos
      const [leituraExistente] = await pool.query(
        "SELECT qtd_livros FROM leituras WHERE id_aluno = ?",
        [ra]
      );

      // adiciona + 1 na qtd livros
      if (leituraExistente.length > 0) {
        // JÁ EXISTE - atualiza incrementando +1
        const qtdAtual = leituraExistente[0].qtd_livros;
        const novaQtd = qtdAtual + 1;

        // calcula a nova pontuação
        let novaPontuacao;
        if (novaQtd <= 5) {
          novaPontuacao = "INICIANTE";
        } else if (novaQtd <= 10) {
          novaPontuacao = "REGULAR";
        } else if (novaQtd <= 20) {
          novaPontuacao = "ATIVO";
        } else {
          novaPontuacao = "EXTREMO";
        }

        await pool.query(
          "UPDATE leituras SET qtd_livros = ?, pontuacao = ? WHERE id_aluno = ?",
          [novaQtd, novaPontuacao, ra]
        );

      } else {
        // se não existe registro do launo em leituras
        // cria um registro com qtd livros = 1
        await pool.query(
          `INSERT INTO leituras (id_aluno, qtd_livros, pontuacao) VALUES (?, ?, ?)`,
          [ra, 1, "INICIANTE"]
        );
      }
    } catch (err) {
      console.error("❌ ERRO ao atualizar leituras:", err.message);
    }

    return res.status(201).json({
      mensagem: "Devolução realizada com sucesso!",
      id_devolucao: insertDevolucao.insertId,
    });
  } catch (err) {
    console.error("❌ Erro no servidor:", err);
    return res.status(500).json({ erro: "Erro no servidor." });
  }
});

module.exports = router;
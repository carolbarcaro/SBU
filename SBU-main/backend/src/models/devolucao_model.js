const pool = require('../src/db/bootstrap.js');

class Devolucao {

  // Registrar devolução
  static async create(data) {
    try {
      const { id_emprestimo, observacao } = data;

      if (!id_emprestimo) throw new Error("ID do empréstimo é obrigatório");

      // Verifica se existe empréstimo
      const [emprestimo] = await pool.execute(
        "SELECT * FROM emprestimos WHERE id_emprestimo = ?",
        [id_emprestimo]
      );

      if (!emprestimo.length) throw new Error("Empréstimo não encontrado");

      // Verifica se já foi devolvido
      if (emprestimo[0].situacao === "devolvido")
        throw new Error("Esse empréstimo já foi devolvido");

      // Insere devolução
      const sql = `
        INSERT INTO devolucoes
        (id_emprestimo, observacao)
        VALUES (?, ?)
      `;

      const [result] = await pool.execute(sql, [
        id_emprestimo, observacao || null
      ]);

      // Marca empréstimo como devolvido
      await pool.execute(`
        UPDATE emprestimos 
        SET situacao = 'devolvido'
        WHERE id_emprestimo = ?
      `, [id_emprestimo]);

      // Libera livro novamente
      await pool.execute(`
        UPDATE livros 
        SET situacao_livo = 'disponivel'
        WHERE ID_livo = ?
      `, [emprestimo[0].id_livro]);

      return result;

    } catch (error) {
      throw error;
    }
  }

  // Buscar todas devoluções
  static async findAll() {
    try {
      const [rows] = await pool.execute(`
        SELECT d.*, e.ra_aluno, e.id_livro, l.titulo_livo
        FROM devolucoes d
        JOIN emprestimos e ON e.id_emprestimo = d.id_emprestimo
        JOIN livros l ON l.ID_livo = e.id_livro
        ORDER BY d.data_devolucao DESC
      `);

      return rows;
    } catch (error) {
      throw error;
    }
  }

}

module.exports = Devolucao;

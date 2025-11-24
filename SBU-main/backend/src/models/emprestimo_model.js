const pool = require('../src/db/bootstrap.js');

class Emprestimo {

  // Criar um empréstimo
  static async create(data) {
    try {
      const { ra_aluno, id_livro } = data;

      if (!ra_aluno) throw new Error("RA do aluno é obrigatório");
      if (!id_livro) throw new Error("ID do livro é obrigatório");

      // Verifica se o livro está disponível
      const [livro] = await pool.execute(
        "SELECT situacao FROM livro WHERE id_livro = ?",
        [id_livro]
      );

      if (!livro.length) throw new Error("Livro não encontrado");
      if (livro[0].situacao !== "DISPONIVEL")
        throw new Error("Livro não está disponível para empréstimo");

      // Faz o empréstimo
      const sql = `
        INSERT INTO emprestimo 
        (ra_aluno, id_livro, data_emprestimo, horario_emprestimo)
        VALUES (?, ?, CURDATE(), CURTIME())
      `;

      const [result] = await pool.execute(sql, [
        ra_aluno, id_livro
      ]);

      // Atualiza o livro
      await pool.execute(
        "UPDATE livro SET situacao = 'EMPRESTADO' WHERE id_livro = ?",
        [id_livro]
      );

      return result;

    } catch (error) {
      throw error;
    }
  }

  // Buscar todos empréstimos
  static async findAll() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          e.*, 
          l.titulo,
          a.nome 
        FROM emprestimo e
        JOIN livro l ON l.id_livro = e.id_livro
        JOIN aluno a ON a.ra_aluno = e.ra_aluno
        ORDER BY e.data_emprestimo DESC
      `);

      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Buscar por ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM emprestimo WHERE id_emprestimo = ?",
        [id]
      );

      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Buscar aluno via FK
  static async findAlunoByEmprestimo(id_emprestimo) {
    try {
      const sql = `
        SELECT 
          a.ra_aluno,
          a.nome
        FROM emprestimo e
        INNER JOIN aluno a ON a.ra_aluno = e.ra_aluno
        WHERE e.id_emprestimo = ?
      `;

      const [rows] = await pool.execute(sql, [id_emprestimo]);
      return rows[0];

    } catch (error) {
      throw error;
    }
  }

}

module.exports = Emprestimo;

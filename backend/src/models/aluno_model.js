const pool = require('../src/db/bootstrap.js');

class Aluno {
  // Método para criar um novo aluno
  static async create(alunoData) {
    try {
      const { ra_aluno, nome, email, telefone } = alunoData;

      // ✅ Validações manuais
      if (!ra_aluno || ra_aluno.trim() === '') {
        throw new Error('RA do aluno é obrigatório');
      }
      if (!nome || nome.trim() === '') {
        throw new Error('Nome do aluno é obrigatório');
      }
      if (nome.length < 1 || nome.length > 100) {
        throw new Error('Nome deve ter entre 1 e 100 caracteres');
      }
      if (email && email.length > 100) {
        throw new Error('Email deve ter no máximo 100 caracteres');
      }
      if (telefone && telefone.length > 20) {
        throw new Error('Telefone deve ter no máximo 20 caracteres');
      }

      // SQL para inserir o aluno
      const sql = `
        INSERT INTO aluno (ra_aluno, nome, email, telefone)
        VALUES (?, ?, ?, ?)
      `;

      const [result] = await pool.execute(sql, [
        ra_aluno,
        nome,
        email || null,
        telefone || null
      ]);

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Método para buscar todos os alunos
  static async findAll() {
    try {
      const sql = 'SELECT * FROM aluno ORDER BY nome ASC';
      const [rows] = await pool.execute(sql);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Método para buscar aluno por RA
  static async findByRa(ra) {
    try {
      const sql = 'SELECT * FROM aluno WHERE ra_aluno = ?';
      const [rows] = await pool.execute(sql, [ra]);
      return rows[0]; // retorna o primeiro resultado ou undefined
    } catch (error) {
      throw error;
    }
  }

  // Método para deletar aluno
  static async deleteByRa(ra) {
    try {
      const sql = 'DELETE FROM aluno WHERE ra_aluno = ?';
      const [result] = await pool.execute(sql, [ra]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Método para atualizar aluno
  static async update(ra, novoAluno) {
    try {
      const { nome, email, telefone } = novoAluno;

      const sql = `
        UPDATE aluno 
        SET nome = ?, email = ?, telefone = ?
        WHERE ra_aluno = ?
      `;

      const [result] = await pool.execute(sql, [
        nome,
        email || null,
        telefone || null,
        ra
      ]);

      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Aluno;

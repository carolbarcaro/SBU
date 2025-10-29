const pool = require('../src/db/bootstrap.js');

class Livro {
  // Método para criar um novo livro
  static async create(livroData) {
    try {
      const { cod_livo, titulo_livo, autor_livo, ano } = livroData;
      
      // Validações manuais
      if (!cod_livo || cod_livo.trim() === '') {
        throw new Error('Código do livro é obrigatório');
      }
      if (!titulo_livo || titulo_livo.trim() === '') {
        throw new Error('Título do livro é obrigatório');
      }
      if (titulo_livo.length < 1 || titulo_livo.length > 255) {
        throw new Error('Título deve ter entre 1 e 255 caracteres');
      }
      if (!autor_livo || autor_livo.trim() === '') {
        throw new Error('Autor do livro é obrigatório');
      }
      if (autor_livo.length < 1 || autor_livo.length > 255) {
        throw new Error('Autor deve ter entre 1 e 255 caracteres');
      }
      if (!ano || isNaN(ano)) {
        throw new Error('Ano deve ser um número inteiro');
      }
      if (ano < 1000) {
        throw new Error('Ano deve ser maior ou igual a 1000');
      }
      if (ano > new Date().getFullYear()) {
        throw new Error('Ano não pode ser maior que ${new Date().getFullYear()}');
      }

      // SQL para inserir o livro (ID_livo é auto increment, não precisa enviar)
      const sql = `
        INSERT INTO livros 
        (cod_livo, titulo_livo, autor_livo, ano, situacao_livo, data_cadastro) 
        VALUES (?, ?, ?, ?, 'disponivel', NOW())
      `;
      
      const [result] = await pool.execute(sql, [
        cod_livo, 
        titulo_livo, 
        autor_livo, 
        ano
      ]);
      
      return result;
      
    } catch (error) {
      throw error;
    }
  }

  // Método para buscar todos os livros
  static async findAll() {
    try {
      const sql = 'SELECT * FROM livros ORDER BY data_cadastro DESC';
      const [rows] = await pool.execute(sql);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Método para buscar livro por ID
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM livros WHERE ID_livo = ?';
      const [rows] = await pool.execute(sql, [id]);
      return rows[0]; // Retorna o primeiro resultado ou undefined
    } catch (error) {
      throw error;
    }
  }

  // Método para buscar livro por código
  static async findByCodigo(codigo) {
    try {
      const sql = 'SELECT * FROM livros WHERE cod_livo = ?';
      const [rows] = await pool.execute(sql, [codigo]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Livro;
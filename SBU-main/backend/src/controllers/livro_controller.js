const Livro = require('../models/livro_model');

// Criar novo livro
exports.createLivro = async (req, res) => {
  try {
    const { cod_livo, titulo_livo, autor_livo, ano } = req.body;

    // Validações básicas no controller
    if (!cod_livo || !titulo_livo || !autor_livo || !ano) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
    }

    // Converter ano para número
    const anoNumero = parseInt(ano);
    if (isNaN(anoNumero)) {
      return res.status(400).json({
        success: false,
        message: 'Ano deve ser um número válido'
      });
    }

    // Criar livro
    const result = await Livro.create({
      cod_livo: cod_livo.trim(),
      titulo_livo: titulo_livo.trim(),
      autor_livo: autor_livo.trim(),
      ano: anoNumero
    });

    res.status(201).json({
      success: true,
      message: 'Livro cadastrado com sucesso!',
      data: {
        insertId: result.insertId,
        cod_livo: cod_livo.trim(),
        titulo_livo: titulo_livo.trim(),
        autor_livo: autor_livo.trim(),
        ano: anoNumero,
        situacao_livo: 'disponivel'
      }
    });

  } catch (error) {
    console.error('Erro ao criar livro:', error);

    // Tratar erros específicos do MySQL
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Já existe um livro com este código'
      });
    }

    // Tratar erros de validação do model
    if (error.message.includes('obrigatório') || 
        error.message.includes('deve ter entre') || 
        error.message.includes('deve ser')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar todos os livros
exports.getAllLivros = async (req, res) => {
  try {
    const livros = await Livro.findAll();

    res.json({
      success: true,
      data: livros,
      count: livros.length
    });

  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar livro por ID
exports.getLivroById = async (req, res) => {
  try {
    const { id } = req.params;
    const livro = await Livro.findById(id);

    if (!livro) {
      return res.status(404).json({
        success: false,
        message: 'Livro não encontrado'
      });
    }

    res.json({
      success: true,
      data: livro
    });

  } catch (error) {
    console.error('Erro ao buscar livro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar livro por código
exports.getLivroByCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const livro = await Livro.findByCodigo(codigo);

    if (!livro) {
      return res.status(404).json({
        success: false,
        message: 'Livro não encontrado'
      });
    }

    res.json({
      success: true,
      data: livro
    });

  } catch (error) {
    console.error('Erro ao buscar livro por código:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
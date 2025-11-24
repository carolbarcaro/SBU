const Aluno = require('../models/aluno_model');

// Criar novo aluno
exports.createAluno = async (req, res) => {
  try {
    const { ra_aluno, nome, email, telefone } = req.body;

    // ✅ Validações básicas
    if (!ra_aluno || !nome) {
      return res.status(400).json({
        success: false,
        message: 'Os campos ra_aluno e nome são obrigatórios'
      });
    }

    // ✅ Criar aluno no banco
    const result = await Aluno.create({
      ra_aluno: ra_aluno.trim(),
      nome: nome.trim(),
      email: email ? email.trim() : null,
      telefone: telefone ? telefone.trim() : null
    });

    res.status(201).json({
      success: true,
      message: 'Aluno cadastrado com sucesso!',
      data: {
        insertId: result.insertId,
        ra_aluno: ra_aluno.trim(),
        nome: nome.trim(),
        email: email ? email.trim() : null,
        telefone: telefone ? telefone.trim() : null
      }
    });

  } catch (error) {
    console.error('Erro ao criar aluno:', error);

    // ⚠️ Tratar erros específicos do MySQL
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Já existe um aluno com este RA'
      });
    }

    // ⚠️ Tratar erros genéricos de validação
    if (error.message.includes('obrigatório') || 
        error.message.includes('inválido')) {
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

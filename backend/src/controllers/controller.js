const Emprestimo = require('../models/emprestimo_model');

exports.getEmprestimos = async (req, res) => {
  try {
    const emprestimos = await Emprestimo.findAll();

    res.json({
      success: true,
      data: emprestimos,
      count: emprestimos.length
    });

  } catch (error) {
    console.error('Erro ao buscar emprestimos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

exports.getAlunoDoEmprestimo = async (req, res) => {
  try {
    const { id } = req.params;

    const aluno = await Emprestimo.findAlunoByEmprestimo(id);

    if (!aluno) {
      return res.status(404).json({
        success: false,
        message: 'Nenhum aluno encontrado para este empréstimo'
      });
    }

    res.json({
      success: true,
      data: aluno
    });

  } catch (error) {
    console.error("Erro ao buscar aluno do empréstimo:", error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

const express = require('express'); // é um framework que facilita a criação de servidores web e APIs
const router = express.Router(); // é um objeto do express que organiza e gerencia rotas específicas
const pool = require('../db'); // é um conjunto de conexões com o banco de dados que ficam prontas para uso

// rota para fazer o cadastro do livro. /cadastro é o endpoint da rota, o endereço final da API 
router.post('/cadastro', async (req, res) => {  //async é para fazer uma função assíncrona, ou seja, o código faz outras coisas enquanto espera a resposta do banco de dados (ferver a água do café, vai lavar louça)
    const { titulo, codigo, ano, editora } = req.body; // cria 4 variáveis que recebem os dados enviados no corpo da requisição (req.body - dados que o front envia para o back). invés de criar uma req para cada variável, usa desestruturação para pegar todas de uma vez só

    if (!titulo || !codigo || !ano || !editora) { // é para verificar se algum dos campos obrigatórios está vazio"
        return res.status(400).json({message: "Todas as informações são obrigatórias! Preencha-as para continuar."}); // se algum campo estiver vazio, retorna um status 400 (requisição inválida) e uma mensagem de erro em formato json
    }

    try {
        const [novoLivro] = await pool.query( // faz uma consulta no banco de dados usando o pool de conexões. await é para esperar a resposta do banco antes de continuar o código, mas sem ficar parado
            'insert into livro (titulo, codigo, ano, editora) values (?, ?, ?, ?)', // é a query SQL que insere um novo livro na tabela livro, com os valores recebidos no corpo da requisição
            [titulo, codigo, ano, editora] // são os valores que substituem os ? na query SQL
        );
        res.status(201).json({message: "Livro cadastrado com sucesso!", id: novoLivro.insertId}); // se der certo, retorna o status 201 (criado) e uma mensagem de sucesso em formato json, junto com o id do novo livro criado (que o front precisa para outras operações, tipo get)   
    }
    catch (error) {
        console.error(error); // se der erro, mostra o erro no console 
        if (error.code == 'ER_DUP_ENTRY') { // verifica se o erro é de entrada duplicada (código já existe no banco)
             return res
                .status(409)
                .json({ message: 'Código já cadastrado! Utilize outro código para cadastrar o livro.' }); // retorna o status 409 (conflito) e uma mensagem de erro em formato json
             }
        res.status(500).json({message: "Erro no servidor. Tente novamente mais tarde."}); // retorna o status 500 (erro interno do servidor) e uma mensagem de erro em formato json
    }
});
module.exports = router; // exporta o router para ser usado em outros arquivos
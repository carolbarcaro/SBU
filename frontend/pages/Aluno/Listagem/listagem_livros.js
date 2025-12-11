document.addEventListener("DOMContentLoaded", async () => {

    const conteudo = document.getElementById("conteudo");

    // Array para armazenar todos os livros
    let todosLivros = [];

    // Função para buscar dados da API
    async function fetchJSON(url) {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`Erro ${res.status}: ${res.statusText}`);
            }
            return res.json();
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw new Error(`Não foi possível conectar com o servidor. Verifique se o backend está rodando na porta 3000.`);
        }
    }

    // Carregar todos os livros do banco de dado
    async function carregarTodosLivros() {
        try {
            conteudo.innerHTML = '<div class="loading">Carregando livros...</div>';
            
            console.log('Buscando livros da API...');
            // Use a rota correta do listarRoutes
            const response = await fetch('http://localhost:3000/api/listarRoutes/listarlivros', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            const livros = await response.json();
            
            if (livros.length === 0) {
                conteudo.innerHTML = `
                    <div class="vazio">
                        Nenhum livro cadastrado no sistema.
                        <br>Os livros aparecerão aqui automaticamente quando forem cadastrados.
                    </div>
                `;
            } else {
                //Atribuir à variável todosLivros
                todosLivros = livros;
                renderizarLivros(todosLivros);
            }
            
        } catch (error) {
            console.error('Erro ao carregar livros:', error);
            conteudo.innerHTML = `
                <div class="vazio" style="color: #e74c3c;">
                    Erro de conexão
                    <br>${error.message}
                    <br><br>
                    <strong>Soluções:</strong>
                    <br>• Verifique se o backend está rodando
                    <br>• Execute: <code>npm start</code> na pasta do backend
                </div>
            `;
        }
    }

    // Função para renderizar os livros na tela
    function renderizarLivros(livros) {
        if (!livros || livros.length === 0) {
            conteudo.innerHTML = `
                <div class="vazio">
                    Nenhum livro cadastrado no sistema.
                    <br>Os livros aparecerão aqui automaticamente quando forem cadastrados.
                </div>
            `;
            return;
        }

        // Ordena os livros por título
        const livrosOrdenados = livros.sort((a, b) => a.titulo.localeCompare(b.titulo));
        conteudo.innerHTML = livrosOrdenados.map(livro => criarCardLivro(livro)).join('');
        
        // Atualiza o contador de livros
        atualizarContadorLivros(livrosOrdenados);
    }

    // Função para atualizar o contador de livros no header
    function atualizarContadorLivros(livros) {
        const totalLivros = livros.length;
        const livrosDisponiveis = livros.filter(l => l.situacao === "DISPONIVEL").length;
        const livrosEmprestados = livros.filter(l => l.situacao === "EMPRESTADO").length;
        
        // Atualiza o texto do header
        const textTopo = document.getElementById('texttopo');
        if (textTopo) {
            textTopo.innerHTML = `Total: ${totalLivros} livros | Disponível: ${livrosDisponiveis} | Emprestado: ${livrosEmprestados}`;
        }
    }

    // Função para criar o card de um livro (APENAS VISUALIZAÇÃO - SEM EMPRÉSTIMO)
    function criarCardLivro(livro) {
        const disponivel = livro.situacao === "DISPONIVEL";
        const statusClass = disponivel ? 'disponivel' : 'indisponivel';
        const statusText = disponivel ? 'DISPONÍVEL' : 'INDISPONÍVEL';

        return `
            <div class="card-livro ${statusClass}">
                <div class="card-header">
                    ${livro.titulo || 'Título não informado'}
                </div>
                <div class="card-body">
                    <div class="info-livro">
                        <span class="label">Código:</span>
                        <span class="valor">${livro.codigo || 'N/A'}</span>
                    </div>
                    <div class="info-livro">
                        <span class="label">Editora:</span>
                        <span class="valor">${livro.editora || 'Não informada'}</span>
                    </div>
                    <div class="info-livro">
                        <span class="label">Ano:</span>
                        <span class="valor">${livro.ano || 'N/A'}</span>
                    </div>
                    <div class="info-livro">
                        <span class="label">ID:</span>
                        <span class="valor">#${livro.id_livro}</span>
                    </div>
                    <div class="status ${statusClass}">
                        ${statusText}
                    </div>
                </div>
            </div>
        `;
    }

    // Função para verificar se há livros novos
    async function verificarAtualizacoes() {
        try {
            const livrosAtualizados = await fetchJSON('http://localhost:3000/api/listarRoutes/listarlivros');
            
            // Verifica se o número de livros mudou
            if (livrosAtualizados.length !== todosLivros.length) {
                console.log('Novos livros detectados! Atualizando...');
                todosLivros = livrosAtualizados;
                renderizarLivros(todosLivros);
            }
            
            // Verifica se algum livro foi modificado (mudança de status)
            const livrosModificados = livrosAtualizados.some((livroAtual, index) => {
                const livroAntigo = todosLivros[index];
                return !livroAntigo || 
                       livroAtual.situacao !== livroAntigo.situacao ||
                       livroAtual.titulo !== livroAntigo.titulo;
            });
            
            if (livrosModificados) {
                console.log('Livros modificados detectados! Atualizando...');
                todosLivros = livrosAtualizados;
                renderizarLivros(todosLivros);
            }
            
        } catch (error) {
            console.error('Erro na verificação de atualizações:', error);
        }
    }

    // Iniciar verificação automática a cada 5 segundos
    function iniciarAtualizacaoAutomatica() {
        setInterval(verificarAtualizacoes, 5000); // 5 segundos
    }

    // Carregar livros ao iniciar e iniciar atualização automática
    await carregarTodosLivros();
    iniciarAtualizacaoAutomatica();
});
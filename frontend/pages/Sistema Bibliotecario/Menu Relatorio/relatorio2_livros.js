async function carregarLivros() {
    try {
        console.log('Iniciando carregamento de livros...');
        
        const response = await fetch('http://localhost:3000/api/relatorios/relatorio2');
        
        console.log('Status da resposta:', response.status);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Dados recebidos:', data);

        const tbody = document.getElementById('corpoTabela');
        const elementoTotal = document.querySelector('#TituloPagina p');
        
        // Atualiza o total
        if (elementoTotal) {
            elementoTotal.textContent = `Total de livros em atraso no sistema: ${data.totalLivros}`;
        }

        // Limpa a tabela
        tbody.innerHTML = "";

        // Se não há livros
        if (!data.livros || data.livros.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Nenhum livro em atraso encontrado</td></tr>';
            return;
        }

        // Preenche a tabela
        data.livros.forEach(livro => {
            const tr = document.createElement('tr');
            
            const classeAtraso = livro.dias_em_atraso > 10 ? 'atraso-grave' : 
                                livro.dias_em_atraso > 5 ? 'atraso-medio' : 'atraso-normal';
            
            tr.innerHTML = `
                <td>${livro.id_livro || ''}</td>
                <td>${livro.titulo || ''}</td>
                <td>${livro.codigo || ''}</td>
                <td>${livro.ano || ''}</td>
                <td>${livro.editora || ''}</td>
                <td class="status-emprestado">${livro.situacao || 'EMPRESTADO'}</td>
                <td>${livro.data_emprestimo ? new Date(livro.data_emprestimo).toLocaleDateString('pt-BR') : ''}</td>
                <td>${livro.ra || ''}</td>
                <td>${livro.nome_aluno || ''}</td>
                <td class="${classeAtraso}">${livro.dias_em_atraso ? `${livro.dias_em_atraso} dias` : '0 dias'}</td>
            `;
            tbody.appendChild(tr);
        });

        console.log(`Tabela preenchida com ${data.livros.length} livros!`);

    } catch (error) {
        console.error("Erro ao carregar livros:", error);
        
        const tbody = document.getElementById('corpoTabela');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; color: red; padding: 20px;">
                        <strong>Erro ao carregar dados</strong><br>
                        ${error.message}<br><br>
                        <strong>Verifique:</strong><br>
                        1. Servidor está rodando (node server.js)<br>
                        2. Banco de dados está conectado<br>
                        3. Console para mais detalhes
                    </td>
                </tr>
            `;
        }
    }
}

// Testa se o backend está respondendo
async function testarBackend() {
    try {
        const response = await fetch('http://localhost:3000/api');
        const data = await response.json();
        console.log('Backend OK:', data.message);
        return true;
    } catch (error) {
        console.log('Backend OFFLINE:', error.message);
        return false;
    }
}

// Quando a página carregar
document.addEventListener('DOMContentLoaded', async function() {
    const backendOk = await testarBackend();
    if (backendOk) {
        carregarLivros();
    }
});
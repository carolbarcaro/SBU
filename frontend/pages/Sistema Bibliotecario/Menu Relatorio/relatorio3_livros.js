async function carregarLivros() {
    try {
        console.log('Iniciando carregamento de livros devolvidos...');
        
        const response = await fetch('http://localhost:3000/api/relatorios/relatorio3');
        
        console.log('Status da resposta:', response.status);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Dados recebidos:', data);

        const tbody = document.getElementById('corpoTabela');
        const elementoTotal = document.querySelector('#TituloPagina p');
        
        if (elementoTotal) {
            elementoTotal.textContent = `Total de livros devolvidos no sistema: ${data.totalLivros}`;
        }

        tbody.innerHTML = "";

        if (!data.livros || data.livros.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Nenhum livro devolvido encontrado</td></tr>';
            return;
        }

        data.livros.forEach(livro => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${livro.id_livro || ''}</td>
                <td>${livro.titulo || ''}</td>
                <td>${livro.codigo || ''}</td>
                <td class="status-devolvido">${livro.situacao || 'DISPONIVEL'}</td>
                <td>${livro.data_emprestimo ? new Date(livro.data_emprestimo).toLocaleDateString('pt-BR') : ''}</td>
                <td>${livro.data_devolucao ? new Date(livro.data_devolucao).toLocaleDateString('pt-BR') : ''}</td>
                <td>${livro.ra || ''}</td>
                <td>${livro.nome_aluno || ''}</td>            
            `;
            tbody.appendChild(tr);
        });

        console.log(`Tabela preenchida com ${data.livros.length} livros devolvidos!`);

    } catch (error) {
        console.error("Erro ao carregar livros devolvidos:", error);
        
        const tbody = document.getElementById('corpoTabela');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 20px;">
                        <strong>Erro ao carregar dados</strong><br>
                        ${error.message}<br><br>
                    </td>
                </tr>
            `;
        }
    }
}

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

document.addEventListener('DOMContentLoaded', async function() {
    const backendOk = await testarBackend();
    if (backendOk) {
        carregarLivros();
    }
});
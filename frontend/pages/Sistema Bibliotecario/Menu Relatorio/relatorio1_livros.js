async function carregarLivros() {
    try {
        console.log('Iniciando carregamento de livros...');
        
        // Tente estas rotas alternativas:
        const response = await fetch('http://localhost:3000/api/relatorios/relatorio1', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log('Status da resposta:', response.status);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dados recebidos:', data);

        const tbody = document.getElementById('corpoTabela');
        
        if (!tbody) {
            console.error('Elemento corpoTabela não encontrado!');
            return;
        }

        const elementoTotal = document.querySelector('#TituloPagina p');
        if (elementoTotal) {
            elementoTotal.innerHTML = `Total de livros cadastrados no sistema: <strong>${data.totalLivros}</strong>`;
        }

        tbody.innerHTML = "";

        if (data.livros.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">Nenhum livro cadastrado</td></tr>';
            return;
        }

        data.livros.forEach(livro => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${livro.id_livro || ''}</td>
                <td>${livro.titulo || ''}</td>
                <td>${livro.codigo || ''}</td>
                <td>${livro.editora || ''}</td>
                <td>${livro.ano || ''}</td>
                <td>${livro.situacao || 'Disponível'}</td>
            `;
            tbody.appendChild(tr);
        });

        console.log('Tabela preenchida com sucesso!');

    } catch (error) {
        console.error("Erro ao carregar livros:", error);
        // Mostrar mensagem de erro para o usuário
        const tbody = document.getElementById('corpoTabela');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6">Erro ao carregar dados</td></tr>';
        }
    }
}

// Alternativa para o window.onload
document.addEventListener('DOMContentLoaded', carregarLivros);
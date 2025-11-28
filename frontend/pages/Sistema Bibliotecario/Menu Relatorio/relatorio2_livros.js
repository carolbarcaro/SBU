async function carregarLivros() {
    try {
        console.log('Iniciando carregamento de livros...');
        
        const rotasParaTestar = [
            'http://localhost:3000/api/relatorios/relatorio2',
            'http://localhost:3000/relatorios/relatorio2',
            'http://localhost:3000/relatorio2'
        ];

        let response;
        let data;
        let success = false;

        for (const rota of rotasParaTestar) {
            try {
                console.log('Tentando rota:', rota);
                response = await fetch(rota, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                if (response.ok) {
                    data = await response.json();
                    console.log('Rota funcionou:', rota);
                    success = true;
                    break;
                } else {
                    console.log(`Rota ${rota} retornou status: ${response.status}`);
                }
            } catch (e) {
                console.log('Erro na rota:', rota, e.message);
                continue;
            }
        }

        if (!success) {
            throw new Error('Nenhuma das rotas funcionou. Verifique a configuração do servidor.');
        }

        console.log('Dados recebidos:', data);

        const tbody = document.getElementById('corpoTabela');
        
        if (!tbody) {
            console.error('Elemento corpoTabela não encontrado!');
            return;
        }

        const elementoTotal = document.querySelector('#TituloPagina p');
        if (elementoTotal) {
            elementoTotal.textContent = `Total de livros em atraso no sistema: ${data.totalLivros}`;
        }

        tbody.innerHTML = "";

        if (data.livros.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Nenhum livro em atraso encontrado</td></tr>';
            return;
        }

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
                <td class="${classeAtraso}">${livro.dias_em_atraso ? `${livro.dias_em_atraso} dias` : ''}</td>
            `;
            tbody.appendChild(tr);
        });

        console.log(`Tabela preenchida com ${data.livros.length} livros em atraso!`);

    } catch (error) {
        console.error("Erro ao carregar livros:", error);
        
        const tbody = document.getElementById('corpoTabela');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; color: red; padding: 20px;">
                        <strong>Erro ao carregar dados</strong><br>
                        ${error.message}<br>
                        <small>Verifique se o servidor backend está rodando na porta 3000</small>
                    </td>
                </tr>
            `;
        }
    }
}

async function testarBackend() {
    try {
        const testResponse = await fetch('http://localhost:3000/api');
        if (testResponse.ok) {
            console.log('Backend está respondendo');
        } else {
            console.log('Backend não está respondendo corretamente');
        }
    } catch (e) {
        console.log('Backend não está acessível');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    testarBackend();
    carregarLivros();
});
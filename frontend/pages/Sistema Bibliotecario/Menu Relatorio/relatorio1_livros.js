async function carregarLivros() {
    try {
        const response = await fetch('/api/livros'); // rota do backend
        const livros = await response.json();

        const tbody = document.getElementById('corpoTabela');
        tbody.innerHTML = "";  // limpa antes de preencher

        livros.forEach(livro => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${livro.id}</td>
                <td>${livro.titulo}</td>
                <td>${livro.autor}</td>
                <td>${livro.ano}</td>
            `;

            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro:", error);
    }
}

window.onload = carregarLivros;
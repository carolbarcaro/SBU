// Evento ao clicar no botão
document.getElementById("btnPesquisar").addEventListener("click", buscarLivros);

// ENTER também pesquisa
document.getElementById("searchInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") buscarLivros();
});

// Busca no backend
async function buscarLivros() {
    const termo = document.getElementById("searchInput").value.trim();
    const conteudo = document.getElementById("conteudo");

    conteudo.innerHTML = "<p>Carregando...</p>";

    try {
        // ROTA DO SEU BACKEND
        const resp = await fetch(`http://localhost:3000/livros?search=${termo}`);
        const livros = await resp.json();

        mostrarLivros(livros);

    } catch (err) {
        console.error(err);
        conteudo.innerHTML = "<p>Erro ao buscar livros.</p>";
    }
}

// Exibir livros na tela
function mostrarLivros(livros) {
    const conteudo = document.getElementById("conteudo");
    conteudo.innerHTML = "";

    if (!livros || livros.length === 0) {
        conteudo.innerHTML = "<p class='vazio'>Nenhum livro encontrado.</p>";
        return;
    }

    const disponiveis = livros.filter(l => l.situacao === "DISPONIVEL");
    const indisponiveis = livros.filter(l => l.situacao !== "DISPONIVEL");

    // Disponíveis primeiro
    disponiveis.forEach(livro => conteudo.appendChild(criarCard(livro, true)));

    // Depois indisponíveis
    indisponiveis.forEach(livro => conteudo.appendChild(criarCard(livro, false)));
}

// card visual
function criarCard(livro, disponivel) {
    const card = document.createElement("div");
    card.classList.add("card-classificacao");

    if (!disponivel) {
        card.classList.add("indisponivel");
        card.style.opacity = "0.5";
        card.style.pointerEvents = "none";
    }

    card.innerHTML = `
        <div class="card-header">${livro.titulo}</div>
        <div class="card-body">
            <p class="nivel">${livro.editora || "Editora desconhecida"}</p>
            <p class="total">
                Status: <strong>${disponivel ? "Disponível" : "Emprestado"}</strong>
            </p>
        </div>
    `;

    if (disponivel) {
        card.addEventListener("click", () => {
            alert(`Livro selecionado para empréstimo: ${livro.titulo}`);
        });
    }

    return card;
}

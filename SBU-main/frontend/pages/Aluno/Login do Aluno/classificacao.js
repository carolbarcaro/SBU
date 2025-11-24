document.addEventListener("DOMContentLoaded", async () => {
  const ra = localStorage.getItem("ra_logado");
  const nome = localStorage.getItem("nome_logado");

  if (!ra) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "../Login%20do%20Aluno/login_aluno.html";
    return;
  }

  const boasVindas = document.getElementById("boasVindas");
  if (boasVindas) {
    boasVindas.textContent = `Bem-vindo, ${nome || "Aluno"} - ${ra}`;
  }

  const searchInput = document.getElementById("searchInput");
  const btnPesquisar = document.getElementById("btnPesquisar");
  const conteudo = document.getElementById("conteudo");

  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) {
      const texto = await res.text();
      throw new Error(`Erro ${res.status} em ${url}: ${texto}`);
    }
    return res.json();
  }

  try {
    const classificacao = await fetchJSON(
      `http://localhost:3000/api/alunos/classificacao/${ra}`
    );

    const livros = await fetchJSON(
      `http://localhost:3000/api/alunos/livros-lidos/${ra}`
    );

    let livrosOriginais = livros;

    function render(livrosFiltrados) {
      conteudo.innerHTML = `
        <!-- CARD -->
        <section class="card-classificacao">
          <div class="card-header">Sua Classificação</div>
          <div class="card-body">
            <p class="nivel">${classificacao.nivel}</p>
            <p class="total">Livros lidos nos útilmos 6 meses: <strong>${classificacao.total}</strong></p>
          </div>
        </section>

        <!-- TABELA -->
        ${
          livrosFiltrados.length > 0
            ? `
              <table class="tabela-alunos">
                <thead>
                  <tr>
                    <th>Livro</th>
                    <th>Data de devolução</th>
                  </tr>
                </thead>
                <tbody>
                  ${livrosFiltrados.map(livro => `
                    <tr>
                      <td><strong>${livro.titulo}</strong></td>
                      <td>${new Date(livro.data_devolucao).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            `
            : `<p class="vazio">Você ainda não leu nenhum livro.</p>`
        }
      `;
    }

    function aplicarFiltro() {
      const termo = searchInput.value.trim().toLowerCase();
      const filtrados = livrosOriginais.filter(l =>
        l.titulo.toLowerCase().includes(termo)
      );
      render(filtrados);
    }

    render(livrosOriginais);

    btnPesquisar.addEventListener("click", aplicarFiltro);
    searchInput.addEventListener("keyup", aplicarFiltro);

  } catch (error) {
    console.error(error);
    conteudo.innerHTML =
      "<p class='vazio'>Erro ao carregar dados. Tente novamente mais tarde.</p>";
  }
});

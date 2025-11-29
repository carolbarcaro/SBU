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

  // Função utilitária para requisições com tratamento de erro
  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) {
      const texto = await res.text();
      throw new Error(`Erro ${res.status} em ${url}: ${texto}`);
    }
    return res.json();
  }

  try {
    // Busca classificação (pode vir de 'leituras' ou 'devolucao')
    const classificacao = await fetchJSON(
      `http://localhost:3000/api/alunos/classificacao/${ra}`
    );

    // Busca lista de livros lidos (detalhes sempre de devolucao)
    const livros = await fetchJSON(
      `http://localhost:3000/api/alunos/livros-lidos/${ra}`
    );

    // copia para filtro
    let livrosOriginais = Array.isArray(livros) ? livros : [];

    // render principal
    function render(livrosFiltrados) {
      // monta badge indicando fonte dos dados (se disponível)
      const fonteBadge = classificacao.fonte
        ? `<small class="fonte">Fonte: ${classificacao.fonte}</small>`
        : "";

      // monta card da classificação
      const cardHtml = `
        <section class="card-classificacao">
          <div class="card-header">Sua Classificação ${fonteBadge}</div>
          <div class="card-body">
            <p class="nivel">${classificacao.nivel || classificacao.pontuacao || "—"}</p>
            <p class="total">Livros lidos nos últimos 6 meses: <strong>${classificacao.total ?? classificacao.qtd_livros ?? 0}</strong></p>
          </div>
        </section>
      `;

      // monta tabela ou mensagem vazio
      const tabelaHtml =
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
                ${livrosFiltrados
                  .map((livro) => {
                    // livro.data_devolucao pode vir como string "YYYY-MM-DD" e horário separado
                    let dataStr = "—";
                    try {
                      if (livro.data_devolucao) {
                        // Se houver horário, combine para exibir data + hora
                        if (livro.horario_devolucao) {
                          const dt = new Date(`${livro.data_devolucao}T${livro.horario_devolucao}`);
                          dataStr = dt.toLocaleDateString("pt-BR") + " " + dt.toLocaleTimeString("pt-BR");
                        } else {
                          const dt = new Date(livro.data_devolucao);
                          dataStr = dt.toLocaleDateString("pt-BR");
                        }
                      }
                    } catch (e) {
                      dataStr = livro.data_devolucao || "—";
                    }

                    return `
                      <tr>
                        <td><strong>${livro.titulo || "Título desconhecido"}</strong></td>
                        <td>${dataStr}</td>
                      </tr>
                    `;
                  })
                  .join("")}
              </tbody>
            </table>
          `
          : `<p class="vazio">Você ainda não leu nenhum livro.</p>`;

      conteudo.innerHTML = cardHtml + tabelaHtml;
    }

    function aplicarFiltro() {
      if (!searchInput) return;
      const termo = searchInput.value.trim().toLowerCase();
      const filtrados = livrosOriginais.filter((l) =>
        (l.titulo || "").toLowerCase().includes(termo)
      );
      render(filtrados);
    }

    // render inicial
    render(livrosOriginais);

    // adiciona listeners somente se os elementos existirem
    if (btnPesquisar) btnPesquisar.addEventListener("click", aplicarFiltro);
    if (searchInput) searchInput.addEventListener("keyup", aplicarFiltro);
  } catch (error) {
    console.error(error);
    if (conteudo) {
      conteudo.innerHTML =
        "<p class='vazio'>Erro ao carregar dados. Tente novamente mais tarde.</p>";
    } else {
      alert("Erro ao carregar dados. Confira o console.");
    }
  }
});

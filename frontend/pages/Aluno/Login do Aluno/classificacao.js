// Abre/fecha o menu
function toggleMenu() {
  const menu = document.getElementById("userMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// Fecha o menu ao clicar fora
document.addEventListener("click", function (e) {
  const btn = document.querySelector(".user-btn");
  const menu = document.getElementById("userMenu");

  if (!btn.contains(e.target) && !menu.contains(e.target)) {
    menu.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const ra = localStorage.getItem("ra_logado");
  const nome = localStorage.getItem("nome_logado");

  // mostrar boas-vindas

  const boasVindas = document.getElementById("boasVindas");
  if (boasVindas) {
    boasVindas.textContent = `Bem-vindo, ${nome || "Aluno"} - RA ${ra}`;
  }

  // Função auxiliar para fetch seguro
  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Erro ${res.status} → ${txt}`);
    }
    return res.json();
  }

  try {
    // Buscar classificação do aluno
    const classificacao = await fetchJSON(
      `http://localhost:3000/api/alunos/classificacao/${ra}`
    );

    // Buscar livros devolvidos nos últimos 6 meses
    const livros = await fetchJSON(
      `http://localhost:3000/api/alunos/livros-lidos/${ra}`
    );

    const main = document.getElementById("conteudo");

    // tabela + card no HTML
    main.innerHTML = `
      <section class="card-classificacao">
        <div class="card-header">
          Sua Classificação
        </div>

        <div class="card-body">
          <p class="nivel">${classificacao.nivel}</p>
          <p class="total">
            Livros lidos nos últimos 6 meses: <strong>${classificacao.total}</strong>
          </p>
          <p class="semestre-info">(Classificação válida para os últimos 6 meses)</p>
        </div>
      </section>

      <table class="tabela-alunos">
        <thead>
          <tr>
            <th>Livros</th>
            <th>Data de devolução</th>
          </tr>
        </thead>
        <tbody>
          ${
            livros.length > 0
              ? livros
                  .map(
                    (l) => `
                <tr>
                  <td data-label="Livro">
                    <strong>${l.titulo}</strong>
                  </td>

                  <td data-label="Data">
                    <div class="data-hora">
                      ${new Date(l.data_devolucao).toLocaleDateString("pt-BR")}
                    </div>
                  </td>
                </tr>`
                  )
                  .join("")
              : `
              <tr>
                <td colspan="3" class="vazio">
                  Você ainda não devolveu nenhum livro nos últimos 6 meses.
                </td>
              </tr>`
          }
        </tbody>
      </table>
    `;
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
    document.getElementById("conteudo").innerHTML = `
      <p class="erro">Erro ao carregar informações. Tente novamente mais tarde.</p>
    `;
  }
});

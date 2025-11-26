const searchInput = document.getElementById("searchInput");
const filterLeitor = document.getElementById("filterLeitor");
const tabelaBody = document.querySelector(".tabela-alunos tbody");

async function getLeituras() {
  try {
    const response = await fetch("http://localhost:3000/api/alunos/leituras");

    if (!response.ok) {
      throw new Error("Erro ao buscar leituras");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro na requisição:", error);
  }
}

function classificarAluno(qtdLivros) {
  if (qtdLivros <= 5) return "Leitor Iniciante";
  if (qtdLivros <= 10) return "Leitor Regular";
  if (qtdLivros <= 20) return "Leitor Ativo";
  return "Leitor Extremo";
}

async function carregarTabela() {
  const leituras = await getLeituras();

  tabelaBody.innerHTML = ""; // limpar tabela

  leituras.forEach((l) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${l.id_aluno}</td>
      <td>${l.nome_aluno}</td>
      <td>${l.qtd_livros}</td>
      <td>${classificarAluno(l.qtd_livros)}</td>
    `;

    tabelaBody.appendChild(tr);
  });

  linhas = document.querySelectorAll(".tabela-alunos tbody tr");
}

function filtrarTabela() {
  const texto = searchInput.value.toLowerCase();
  const tipoLeitor = filterLeitor.value;

  const linhas = document.querySelectorAll(".tabela-alunos tbody tr");

  linhas.forEach((linha) => {
    const ra = linha.children[0].innerText.toLowerCase();
    const nome = linha.children[1].innerText.toLowerCase();
    const leitor = linha.children[3].innerText; // classificação

    const combinaTexto = nome.includes(texto) || ra.includes(texto);
    const combinaLeitor = tipoLeitor === "" || leitor.includes(tipoLeitor);

    linha.style.display = combinaTexto && combinaLeitor ? "" : "none";
  });
}


searchInput.addEventListener("input", filtrarTabela);
filterLeitor.addEventListener("change", filtrarTabela);

window.addEventListener("DOMContentLoaded", carregarTabela);

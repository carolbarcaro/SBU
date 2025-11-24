const searchInput = document.getElementById("searchInput");
const filterLeitor = document.getElementById("filterLeitor");
const linhas = document.querySelectorAll(".tabela-alunos tbody tr");

function filtrarTabela() {
  const texto = searchInput.value.toLowerCase();
  const tipoLeitor = filterLeitor.value;

  linhas.forEach((linha) => {
    const nome = linha.querySelector("strong").innerText.toLowerCase();
    const ra = linha.querySelector(".ra").innerText.toLowerCase();
    const leitor = linha.children[1].innerText;

    const combinaTexto = nome.includes(texto) || ra.includes(texto);
    const combinaLeitor = tipoLeitor === "" || leitor.includes(tipoLeitor);

    if (combinaTexto && combinaLeitor) {
      linha.style.display = "";
    } else {
      linha.style.display = "none";
    }
  });
}

searchInput.addEventListener("input", filtrarTabela);
filterLeitor.addEventListener("change", filtrarTabela);

// PEGAR O BOTÃO
const botaoPesquisar = document.getElementById("botao");

// CHAMAR O MÉTODO NO CLIQUE
botaoPesquisar.addEventListener("click", () => {
  console.log(getAlunoDoEmprestimo());
});

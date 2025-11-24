document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login_aluno");
  const toastSucesso = document.getElementById("toast-sucesso");
  const toastErro = document.getElementById("toast-erro");

  function showToast(type, message) {
    const el = type === "success" ? toastSucesso : toastErro;
    if (!el) return;

    el.textContent = message;
    el.classList.remove("show-error", "show-success"); // limpa classes antigas

    if (type === "success") {
      el.classList.add("show-success");
    } else {
      el.classList.add("show-error");
    }

    // some depois de 3s
    setTimeout(() => {
      el.classList.remove("show-error", "show-success");
    }, 3000);
  }

  // usamos o SUBMIT do formulário (o botão já tem form="login_aluno")
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // impede reload da página

    const raInput = document.getElementById("ra");
    const ra = raInput.value.trim();

    // validações
    if (!ra) {
      showToast("error", "Por favor, informe o RA.");
      raInput.focus();
      return;
    }

    if (!/^\d{8}$/.test(ra)) {
      showToast("error", "RA deve ter 8 dígitos numéricos.");
      raInput.focus();
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/alunos/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ra }),
      });

      if (response.ok) {
      const data = await response.json();

      localStorage.setItem("ra_logado", ra);
      localStorage.setItem("nome_logado", data.aluno.nome);

      showToast("success", data.message || "Login realizado com sucesso!");

      setTimeout(() => {
        window.location.href = "../Login%20do%20Aluno/classificacao.html";
      }, 1000);
}

       else {
        let erroMsg = "Erro ao fazer login.";
        try {
          const erro = await response.json();
          erroMsg = erro.message || erro.error || erroMsg;
        } catch (_) {
          // se não vier JSON, mantém mensagem padrão
        }
        showToast("error", erroMsg);
      }
    } catch (error) {
      console.error("Erro no fetch:", error);
      showToast("error", "Erro ao conectar ao servidor.");
    }
  });
});

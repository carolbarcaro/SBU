document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formAluno");
  const botaoEnvio = document.getElementById("botaoEnvio");
  const toastSucesso = document.getElementById("toast-sucesso");
  const toastErro = document.getElementById("toast-erro");

  function showToast(type, message) {
    const el = type === "success" ? toastSucesso : toastErro;
    if (!el) return;

    el.textContent = message;
    el.classList.add("show");

    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(() => {
      el.classList.remove("show");
    }, 3000);
  }

  botaoEnvio.addEventListener("click", async (event) => {
    event.preventDefault(); // evita envio do form real

    // pega valores
    const nome = document.getElementById("nome").value.trim();
    const ra = document.getElementById("ra").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("telefone").value.trim();

    // validação simples
    if (!nome || !ra || !email || !telefone) {
      showToast("error", "Por favor, preencha todos os campos!");
      return;
    }

    if (!/^\d{8}$/.test(ra)) {
      showToast("error", "RA deve ter 8 dígitos numéricos.");
      return;
    }

    try {
      // envia dados ao backend
      const response = await fetch("http://localhost:3000/api/alunos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ra,
          nome,
          email,
          telefone,
        }),
      });

      if (response.ok) {
        showToast("success", "Cadastro realizado com sucesso!");
        form.reset(); // limpa campos depois do sucesso
      } else {
      
        let erroMsg = "Erro ao cadastrar aluno.";
        try {
          const erro = await response.json();
          erroMsg = erro.message || erro.error || erroMsg;
        } catch (_) {
          // ignora se a resposta não for JSON
        }
        showToast("error", erroMsg);
      }
    } catch (error) {
      console.error("Erro no fetch:", error);
      showToast("error", "Erro ao conectar ao servidor.");
    }
  });
});

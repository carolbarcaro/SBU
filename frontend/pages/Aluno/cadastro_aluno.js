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

  botaoEnvio.addEventListener("click", (event) => {
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

    // limpa os campos
    const formAluno = document.getElementById('FormAluno');
  // limpa todos os campos para os valores iniciais
    form.reset();


    // exibe toast de sucesso
    showToast("success", "Cadastro realizado com sucesso!");
  });
});

// colocar a rota
// teste
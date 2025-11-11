document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login_aluno");
  const botaoEnvio = document.querySelector(".btn-login"); // class, não id
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
    event.preventDefault(); // evita envio real do form

    const ra = document.getElementById("ra").value.trim();

    if (!ra) {
      showToast("error", "Por favor, preencha o campo do RA.");
      return;
    }

    if (!/^\d{8}$/.test(ra)) {
      showToast("error", "RA deve ter 8 dígitos numéricos.");
      return;
    }

    // se chegou aqui, está válido
    showToast("success", "RA válido! Efetuando login...");
    
  });
});

// cadastrar novo aluno
router.get('/', async (req, res) => {
try {
const { ra } = req.body;

// insere aluno
const sql = 'SELECT ra FROM aluno';
await pool.query(sql, [ra]);

res.status(201).json({ message: 'Login...' });


} catch (err) {
// tratamento específico para RA duplicado
if (err.code === 'ER_DUP_ENTRY') {
return res.status(400).json({ error: 'Esse RA já está cadastrado!' });
}

console.error('Erro ao cadastrar aluno:', err);
res.status(500).json({ error: 'Erro ao cadastrar aluno.' });

}
});

module.exports = router;
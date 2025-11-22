document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formRetirada");
    const inputRA = document.getElementById("ra");
    const inputCodigo = document.getElementById("codigo");

    // função toast
    function mostrarToast(id, mensagem) {
        const toast = document.getElementById(id);
        toast.textContent = mensagem;

        toast.classList.add("show-toast");

        setTimeout(() => {
            toast.classList.remove("show-toast");
        }, 3000);
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const ra = inputRA.value.trim();
        const codigo = inputCodigo.value.trim();

        // validações
        if (ra.length !== 8) {
            mostrarToast("toast-erro", "O RA deve ter exatamente 8 caracteres!");
            return;
        }

        if (codigo === "" || isNaN(codigo)) {
            mostrarToast("toast-erro", "O código do livro deve ser um número válido!");
            return;
        }

        try {
            const resposta = await fetch("http://localhost:3000/api/retirada/retiradaLivro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ra, codigo: Number(codigo) })
            });

            const data = await resposta.json();

            if (!resposta.ok) {
                mostrarToast("toast-erro", data.erro || "Erro ao registrar retirada!");
                return;
            }

            mostrarToast("toast-sucesso", "Retirada realizada com sucesso!");

            form.reset();

        } catch (erro) {
            mostrarToast("toast-erro", "Falha ao conectar ao servidor.");
        }
    });
});

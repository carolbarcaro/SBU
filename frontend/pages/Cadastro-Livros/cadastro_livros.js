document.addEventListener('DOMContentLoaded', function() {
    const botao = document.getElementById('botao');
    const toastSucesso = document.getElementById('toast-sucesso');
    const toastErro = document.getElementById('toast-erro');

    botao.addEventListener('click', function(event) {
        event.preventDefault(); // evita envio do form (mude se for salvar no banco depois)

        const codigo = document.getElementById('codigo').value.trim();
        const titulo = document.getElementById('titulo').value.trim();
        const editora = document.getElementById('editora').value.trim();
        const ano = document.getElementById('ano').value.trim();

        if (!codigo || !titulo || !editora || !ano) {
            toastErro.textContent = 'Por favor, preencha todos os campos!';
            toastErro.classList.add('show');
            setTimeout(() => toastErro.classList.remove('show'), 3000);
            return;
        }

        // limpa os campos
        document.getElementById('codigo').value = '';
        document.getElementById('titulo').value = '';
        document.getElementById('editora').value = '';
        document.getElementById('ano').value = '';

        // mostra toast de sucesso
        toastSucesso.textContent = 'As informações foram salvas com sucesso!';
        toastSucesso.classList.add('show');
        setTimeout(() => toastSucesso.classList.remove('show'), 3000);
    });
});

document.addEventListener('DOMContentLoaded', function() {
const botao = document.getElementById('botao');
const toastSucesso = document.getElementById('toast-sucesso');
const toastErro = document.getElementById('toast-erro');

botao.addEventListener('click', function(event) {
    event.preventDefault(); // evita envio do form

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

    fetch('http://localhost:3000/api/livros/cadastro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo, titulo, editora, ano })
    })
    .then(async res => {
        const data = await res.json().catch(() => ({})); // tenta ler o JSON, mesmo que vazio

        if (res.status === 409) {
            // código duplicado
            toastErro.textContent = data.message || 'Código já cadastrado!';
            toastErro.classList.add('show');
            setTimeout(() => toastErro.classList.remove('show'), 3000);
            return;
        }

        if (!res.ok) {
            // outro erro do servidor
            toastErro.textContent = data.message || 'Erro ao salvar os dados!';
            toastErro.classList.add('show');
            setTimeout(() => toastErro.classList.remove('show'), 3000);
            return;
        }

        // sucesso
        toastSucesso.textContent = data.message || 'As informações foram salvas com sucesso!';
        toastSucesso.classList.add('show');
        setTimeout(() => toastSucesso.classList.remove('show'), 3000);

        // limpa os campos
        document.getElementById('codigo').value = '';
        document.getElementById('titulo').value = '';
        document.getElementById('editora').value = '';
        document.getElementById('ano').value = '';
    })
    .catch(err => {
        toastErro.textContent = 'Erro ao conectar ao servidor!';
        toastErro.classList.add('show');
        setTimeout(() => toastErro.classList.remove('show'), 3000);
        console.error(err);
    });
});

});
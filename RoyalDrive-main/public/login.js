document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede a página de recarregar sozinha

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msgErro = document.getElementById('mensagem-erro');

    // Limpar mensagens de erro antigas
    msgErro.style.display = 'none';
    msgErro.textContent = '';

    try {
        const resposta = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            // 1. Guardar os dados na "Mochila" do Browser
            localStorage.setItem('token', dados.token);
            localStorage.setItem('usuario_nome', dados.user.nome);
            localStorage.setItem('usuario_role', dados.user.role);
            localStorage.setItem('usuario_id', dados.user.id);

            // 2. Redirecionar para a página correta
            // Se for Admin, vai para o painel de Admin
         if (dados.user.role === 'Administrador') {
    window.location.href = 'admin.html';
} else {
    window.location.href = 'frota.html';
}

        } else {
            // Mostrar erro (ex: senha errada)
            msgErro.textContent = dados.message || 'Erro ao fazer login.';
            msgErro.style.display = 'block';
        }

    } catch (error) {
        console.error('Erro:', error);
        msgErro.textContent = 'Erro ao ligar ao servidor.';
        msgErro.style.display = 'block';
    }
});

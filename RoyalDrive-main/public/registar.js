document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Captura os dados do formulário (Garanta que os IDs no HTML são estes)
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // Envia os dados para a rota de registo do teu servidor
                const resposta = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, password })
                });

                const dados = await resposta.json();

                if (resposta.ok) {
                    alert('Registo efetuado com sucesso! Agora pode fazer login.');
                    window.location.href = 'login.html';
                } else {
                    alert(dados.message || 'Erro ao efetuar o registo.');
                }
            } catch (error) {
                console.error('Erro no registo:', error);
                alert('Erro ao ligar ao servidor.');
            }
        });
    }
});

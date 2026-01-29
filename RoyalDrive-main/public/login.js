const API_URL = 'https://royaldrive-royaldrive.onrender.com/api/auth'; // Confirma se o link do Render está certo

// Função para mostrar erros na tua div bonita em vez de usar alert()
function mostrarErro(mensagem) {
    const erroDiv = document.getElementById('mensagem-erro');
    erroDiv.innerText = mensagem;
    erroDiv.style.display = 'block';
    
    // Esconder após 5 segundos
    setTimeout(() => {
        erroDiv.style.display = 'none';
    }, 5000);
}

async function handleCredentialResponse(response) {
    try {
        const res = await fetch(`${API_URL}/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.credential })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirecionar consoante o cargo
            if (['Administrador', 'GestorAgencia'].includes(data.user.role)) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            mostrarErro(data.message || 'Erro no login Google.');
        }
    } catch (error) {
        mostrarErro('Erro de ligação ao servidor.');
    }
}

window.onload = function () {
    // 1. Lógica do Formulário de Email/Pass
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const res = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    if (['Administrador', 'GestorAgencia'].includes(data.user.role)) {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                } else {
                    mostrarErro(data.message || 'Email ou password errados.');
                }
            } catch (error) {
                mostrarErro("Erro de conexão.");
            }
        });
    }

    // 2. Lógica do Botão Google
    if (window.google) {
        google.accounts.id.initialize({
            client_id: "87622514862-o3hlv3errl0umue53b8mffevgmpttvin.apps.googleusercontent.com",
            callback: handleCredentialResponse
        });
        
        // Agora procura pelo ID correto "googleBtn"
        const btnContainer = document.getElementById("googleBtn");
        if (btnContainer) {
            google.accounts.id.renderButton(
                btnContainer,
                { theme: "outline", size: "large", width: "250", text: "continue_with" } 
            );
        }
    }
};

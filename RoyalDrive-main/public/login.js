const API_URL = 'https://royaldrive.onrender.com/api/auth'; // Mantém o teu link do Render

// Função auxiliar para mostrar erros
function mostrarErro(mensagem) {
    const erroDiv = document.getElementById('mensagem-erro');
    if (erroDiv) {
        erroDiv.innerText = mensagem;
        erroDiv.style.display = 'block';
        
        // Esconder após 5 segundos
        setTimeout(() => {
            erroDiv.style.display = 'none';
        }, 5000);
    }
}

// Callback executado quando o Google devolve o token
async function handleCredentialResponse(response) {
    try {
        const res = await fetch(`${API_URL}/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.credential })
        });

        const data = await res.json();

        if (res.ok) {
            // Guardar sessão
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirecionar consoante o cargo (Admin ou Cliente)
            if (['Administrador', 'GestorAgencia'].includes(data.user.role)) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            mostrarErro(data.message || 'Erro ao iniciar sessão com Google.');
        }
    } catch (error) {
        console.error("Erro login:", error);
        mostrarErro('Não foi possível contactar o servidor.');
    }
}

window.onload = function () {
    // Inicializar o botão Google
    if (window.google) {
        google.accounts.id.initialize({
            client_id: "87622514862-o3hlv3errl0umue53b8mffevgmpttvin.apps.googleusercontent.com",
            callback: handleCredentialResponse
        });
        
        const btnContainer = document.getElementById("googleBtn");
        if (btnContainer) {
            google.accounts.id.renderButton(
                btnContainer,
                { theme: "outline", size: "large", width: "250", text: "continue_with" } 
            );
        }
    }
};

async function carregarHistorico() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const resposta = await fetch('/api/reservas/my', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resposta.ok) throw new Error('Falha ao carregar');

        const reservas = await resposta.json();
        const container = document.getElementById('lista-reservas');
        container.innerHTML = '';

        if (reservas.length === 0) {
            container.innerHTML = '<p>Ainda não efetuou nenhuma reserva.</p>';
            return;
        }

        reservas.forEach(res => {
            container.innerHTML += `
                <div class="reserva-card">
                    <img src="${res.imagem_url || 'img/car-placeholder.png'}" alt="${res.modelo}">
                    <div class="reserva-info">
                        <h3>${res.marca} ${res.modelo}</h3>
                        <p>🗓️ ${new Date(res.data_inicio).toLocaleDateString()} a ${new Date(res.data_fim).toLocaleDateString()}</p>
                        <p>💰 Total: ${res.valor_total}€</p>
                        <span class="status ${res.estado.toLowerCase()}">${res.estado}</span>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('lista-reservas').innerHTML = '<p style="color:red">Erro ao carregar histórico.</p>';
    }
}

document.addEventListener('DOMContentLoaded', carregarHistorico);

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const container = document.getElementById('lista-reservas');

    // Se não tiver token, manda para o login
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const resposta = await fetch('/api/reservas/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // <--- ISTO É CRUCIAL
                'Content-Type': 'application/json'
            }
        });

        if (!resposta.ok) {
            throw new Error('Falha ao buscar reservas');
        }

        const reservas = await resposta.json();

        // Se não tiver reservas
        if (reservas.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#aaa;">Ainda não tens reservas.</p>';
            return;
        }

        // Construir a lista
        let html = '';
        reservas.forEach(r => {
            // Formatar a data para ficar bonita (Dia/Mês/Ano)
            const dataInicio = new Date(r.data_inicio).toLocaleDateString('pt-PT');
            const dataFim = new Date(r.data_fim).toLocaleDateString('pt-PT');

            html += `
                <div class="reserva-item">
                    <img src="${r.imagem_url}" alt="Carro" class="reserva-foto">
                    <div class="reserva-info">
                        <h3>${r.marca} ${r.modelo}</h3>
                        <p>📅 De <strong>${dataInicio}</strong> a <strong>${dataFim}</strong></p>
                        <p>💰 Total: <span style="color: #d4af37; font-weight:bold;">${r.valor_total}€</span></p>
                    </div>
                    <div style="margin-left: auto;">
                        <span class="reserva-status">${r.estado}</span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = `
            <p style="color: #ff6b6b; text-align: center;">
                Erro ao carregar histórico. <br>
                <small>(Vê o terminal do VS Code para saber porquê)</small>
            </p>
        `;
    }
});
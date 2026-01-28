async function carregarMinhasReservas() {
    const token = localStorage.getItem('token');
    
    // Se não houver token, redireciona para o login
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Faz a chamada para a rota /my que definimos no reservationRoutes.js
        const resposta = await fetch('/api/reservas/my', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!resposta.ok) {
            throw new Error('Erro ao carregar o histórico de reservas.');
        }

        const reservas = await resposta.json();
        const container = document.getElementById('lista-reservas'); // Garante que este ID existe no teu HTML
        
        if (!container) return;

        container.innerHTML = '';

        if (reservas.length === 0) {
            container.innerHTML = '<p class="aviso">Ainda não efetuou nenhuma reserva.</p>';
            return;
        }

        // Renderiza cada reserva usando os novos nomes de colunas: data_inicio e data_fim
        reservas.forEach(res => {
            const dataInic = new Date(res.data_inicio).toLocaleDateString();
            const dataFim = new Date(res.data_fim).toLocaleDateString();

            container.innerHTML += `
                <div class="reserva-card">
                    <div class="reserva-header">
                        <h3>${res.marca} ${res.modelo}</h3>
                        <span class="status-badge ${res.estado.toLowerCase()}">${res.estado}</span>
                    </div>
                    <div class="reserva-detalhes">
                        <p><strong>Levantamento:</strong> ${dataInic}</p>
                        <p><strong>Devolução:</strong> ${dataFim}</p>
                        <p><strong>Valor Total:</strong> ${res.valor_total}€</p>
                        <p><strong>Método:</strong> ${res.metodo_pagamento || 'N/A'}</p>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error('Erro:', error);
        const container = document.getElementById('lista-reservas');
        if (container) {
            container.innerHTML = '<p class="erro">Erro ao carregar histórico. Tente fazer login novamente.</p>';
        }
    }
}

// Executa a função quando a página termina de carregar
document.addEventListener('DOMContentLoaded', carregarMinhasReservas);

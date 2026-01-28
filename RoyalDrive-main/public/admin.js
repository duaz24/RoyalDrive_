async function carregarReservasAdmin() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('lista-reservas');

    if (!container) return;

    try {
        const resposta = await fetch('/api/reservas/all', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!resposta.ok) throw new Error('Falha ao carregar reservas');

        const reservas = await resposta.json();
        console.log("📥 Reservas recebidas:", reservas);

        // Limpa o "A carregar pedidos..."
        container.innerHTML = '';

        if (reservas.length === 0) {
            container.innerHTML = '<p>Não existem reservas pendentes.</p>';
            return;
        }

        reservas.forEach(res => {
            const dataInic = new Date(res.data_inicio).toLocaleDateString();
            const dataFim = new Date(res.data_fim).toLocaleDateString();
            
            // Define a classe de cor baseada no estado (pendente, confirmada, etc)
            const classeStatus = `status-${res.estado.toLowerCase()}`;

            container.innerHTML += `
                <div class="reserva-card ${classeStatus}">
                    <div>
                        <strong>#${res.id_reserva} - ${res.nome_cliente || 'Cliente'}</strong><br>
                        <span>🚗 ${res.marca} ${res.modelo}</span><br>
                        <small>📅 ${dataInic} a ${dataFim}</small><br>
                        <strong>💰 ${res.valor_total}€</strong>
                    </div>
                    <div>
                        <span style="display:block; margin-bottom:5px; font-size:0.8rem; text-align:right;">${res.estado}</span>
                        <button class="btn-mini btn-aprovar" onclick="alterarEstado(${res.id_reserva}, 'Confirmada')">Aceitar</button>
                        <button class="btn-mini btn-rejeitar" onclick="alterarEstado(${res.id_reserva}, 'Cancelada')">Recusar</button>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = '<p style="color:red">Erro ao ligar ao servidor.</p>';
    }
}

async function alterarEstado(id, novoEstado) {
    const token = localStorage.getItem('token');
    if (!confirm(`Confirmar alteração para ${novoEstado}?`)) return;

    try {
        const res = await fetch(`/api/reservas/${id}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: novoEstado })
        });

        if (res.ok) {
            alert("Estado atualizado com sucesso!");
            carregarReservasAdmin();
        } else {
            alert("Erro ao atualizar estado.");
        }
    } catch (e) {
        console.error(e);
    }
}

document.addEventListener('DOMContentLoaded', carregarReservasAdmin);

async function carregarReservasAdmin() {
    const token = localStorage.getItem('token');
    try {
        const resposta = await fetch('/api/reservas/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resposta.ok) throw new Error('Erro nas permissões');

        const reservas = await resposta.json();
        const tabela = document.querySelector('#tabela-reservas tbody');
        tabela.innerHTML = '';

        reservas.forEach(res => {
            tabela.innerHTML += `
                <tr>
                    <td>${res.id_reserva}</td>
                    <td>${res.nome_cliente}</td>
                    <td>${res.marca} ${res.modelo}</td>
                    <td>${res.valor_total}€</td>
                    <td><span class="status-${res.estado.toLowerCase()}">${res.estado}</span></td>
                    <td>
                        <button onclick="alterarEstado(${res.id_reserva}, 'Confirmada')" class="btn-aprovar">Aceitar</button>
                        <button onclick="alterarEstado(${res.id_reserva}, 'Cancelada')" class="btn-rejeitar">Recusar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        alert('Erro ao carregar reservas. Verifique se é Administrador.');
    }
}

async function alterarEstado(id, novoEstado) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`/api/reservas/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: novoEstado })
        });
        if (res.ok) {
            alert(`Reserva ${novoEstado}!`);
            carregarReservasAdmin();
        }
    } catch (error) {
        alert('Erro ao atualizar estado.');
    }
}

document.addEventListener('DOMContentLoaded', carregarReservasAdmin);

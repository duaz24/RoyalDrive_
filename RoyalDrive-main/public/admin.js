async function carregarReservasAdmin() {
    const token = localStorage.getItem('token');
    try {
        const resposta = await fetch('/api/reservas/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const reservas = await resposta.json();
        const tabela = document.querySelector('#tabela-reservas tbody');
        tabela.innerHTML = '';

        reservas.forEach(res => {
            tabela.innerHTML += `
                <tr>
                    <td>${res.id_reserva}</td>
                    <td>${res.nome_cliente || 'Cliente'}</td>
                    <td>${res.marca} ${res.modelo}</td>
                    <td>${res.valor_total}€</td>
                    <td>${res.estado}</td>
                    <td>
                        <button onclick="alterarEstado(${res.id_reserva}, 'Confirmada')">Aceitar</button>
                    </td>
                </tr>`;
        });
    } catch (error) {
        console.error('Erro ao carregar:', error);
    }
}
document.addEventListener('DOMContentLoaded', carregarReservasAdmin);

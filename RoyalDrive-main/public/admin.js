async function carregarReservasAdmin() {
    const token = localStorage.getItem('token');
    const msgErro = document.getElementById('mensagem-erro-admin'); // Opcional: para mostrar erros no ecrã

    try {
        // Chamada para a rota /all que aceita 'Administrador' e 'Admin'
        const resposta = await fetch('/api/reservas/all', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!resposta.ok) {
            if (resposta.status === 403) {
                alert("Acesso negado. Certifique-se de que é um Administrador.");
            }
            throw new Error('Falha ao carregar reservas.');
        }

        const reservas = await resposta.json();
        const tabelaCorpo = document.querySelector('#tabela-reservas tbody');
        
        if (!tabelaCorpo) return;
        tabelaCorpo.innerHTML = '';

        if (reservas.length === 0) {
            tabelaCorpo.innerHTML = '<tr><td colspan="6">Nenhuma reserva encontrada.</td></tr>';
            return;
        }

        reservas.forEach(res => {
            const dataInic = new Date(res.data_inicio).toLocaleDateString();
            const dataFim = new Date(res.data_fim).toLocaleDateString();

            tabelaCorpo.innerHTML += `
                <tr>
                    <td>#${res.id_reserva}</td>
                    <td>${res.nome_cliente || 'Utilizador #' + res.id_utilizador}</td>
                    <td>${res.marca} ${res.modelo}</td>
                    <td>${dataInic} - ${dataFim}</td>
                    <td><span class="status-badge ${res.estado.toLowerCase()}">${res.estado}</span></td>
                    <td>
                        <div class="admin-acoes">
                            <button onclick="alterarEstado(${res.id_reserva}, 'Confirmada')" class="btn-aceitar">Aceitar</button>
                            <button onclick="alterarEstado(${res.id_reserva}, 'Cancelada')" class="btn-recusar">Recusar</button>
                        </div>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error('Erro no Admin:', error);
        if (msgErro) msgErro.textContent = "Erro ao carregar a gestão de reservas.";
    }
}

// Função para atualizar o estado da reserva (Aprovar/Recusar)
async function alterarEstado(id, novoEstado) {
    const token = localStorage.getItem('token');
    
    if (!confirm(`Deseja alterar o estado da reserva #${id} para ${novoEstado}?`)) return;

    try {
        const resposta = await fetch(`/api/reservas/${id}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: novoEstado })
        });

        if (resposta.ok) {
            alert(`Reserva ${novoEstado} com sucesso!`);
            carregarReservasAdmin(); // Recarrega a lista
        } else {
            alert("Erro ao atualizar o estado da reserva.");
        }
    } catch (error) {
        console.error('Erro ao atualizar:', error);
    }
}

document.addEventListener('DOMContentLoaded', carregarReservasAdmin);

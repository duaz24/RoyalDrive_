async function carregarReservasAdmin() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('lista-reservas');
    if (!container) return;

    try {
        const resposta = await fetch('/api/reservas/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const reservas = await resposta.json();
        container.innerHTML = '';

        if (!reservas || reservas.length === 0) {
            container.innerHTML = '<p>Nenhuma reserva pendente.</p>';
            return;
        }

        reservas.forEach(res => {
            const dataInic = new Date(res.data_inicio).toLocaleDateString();
            const foto = res.imagem_url || 'https://via.placeholder.com/100x70?text=Sem+Foto';
            const classeStatus = `status-${res.estado.toLowerCase()}`;
            
            container.innerHTML += `
                <div class="reserva-card ${classeStatus}" style="display: flex; gap: 15px; align-items: center; background: #1e1e1e; margin-bottom:15px; padding:15px; border-radius:8px; border-left: 5px solid #d4af37;">
                    <img src="${foto}" style="width: 100px; height: 70px; object-fit: cover; border-radius: 5px;">
                    <div style="flex-grow: 1;">
                        <strong style="color: #d4af37;">#${res.id_reserva} - ${res.nome_cliente || 'Cliente'}</strong><br>
                        <span>🚗 ${res.marca} ${res.modelo}</span><br>
                        <small>📅 ${dataInic} | 💰 ${res.valor_total}€</small>
                    </div>
                    <div style="text-align: right;">
                        <span style="display:block; font-size: 0.7rem; margin-bottom: 5px;">${res.estado}</span>
                        <button class="btn-mini btn-aprovar" onclick="alterarEstado(${res.id_reserva}, 'Confirmada')">Aceitar</button>
                        <button class="btn-mini btn-rejeitar" onclick="alterarEstado(${res.id_reserva}, 'Cancelada')">Recusar</button>
                    </div>
                </div>`;
        });
    } catch (e) { 
        console.error(e);
        container.innerHTML = '<p style="color:red">Erro ao ligar ao servidor.</p>';
    }
}

async function alterarEstado(id, estado) {
    const token = localStorage.getItem('token');
    if (!confirm(`Deseja alterar para ${estado}?`)) return;

    try {
        const res = await fetch(`/api/reservas/${id}/status`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado })
        });
        if (res.ok) carregarReservasAdmin();
    } catch (e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', carregarReservasAdmin);
// Adicionar isto ao fim do teu public/admin.js
document.getElementById('addVehicleForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const dados = {
        marca: document.getElementById('marca').value,
        modelo: document.getElementById('modelo').value,
        ano_fabrico: document.getElementById('ano').value,
        matricula: document.getElementById('matricula').value,
        preco_diario: document.getElementById('preco').value,
        imagem_url: document.getElementById('imagem').value,
        id_tipo_veiculo: document.getElementById('tipo').value,
        id_agencia_atual: document.getElementById('agencia').value,
        cor: "Preto" // Adicionado para evitar erro, já que o controller espera 'cor'
    };

    try {
        const resposta = await fetch('/api/veiculos', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            alert("Sucesso: " + resultado.message);
            location.reload(); // Recarrega para limpar o formulário
        } else {
            alert("Erro: " + resultado.message);
        }
    } catch (error) {
        console.error("Erro ao enviar:", error);
        alert("Erro na ligação ao servidor.");
    }
});

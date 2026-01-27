const token = localStorage.getItem('token');

// 1. ADICIONAR CARRO (O teu código antigo melhorado)
document.getElementById('addVehicleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Recolher dados
    const carro = {
        marca: document.getElementById('marca').value,
        modelo: document.getElementById('modelo').value,
        ano: document.getElementById('ano').value,
        matricula: document.getElementById('matricula').value,
        preco_base_diario: document.getElementById('preco').value,
        imagem_url: document.getElementById('imagem').value,
        id_tipo_veiculo: document.getElementById('tipo').value,
        id_agencia: document.getElementById('agencia').value,
        is_disponivel: true
    };

    try {
        const res = await fetch('/api/veiculos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(carro)
        });

        if (res.ok) {
            alert('✅ Carro adicionado com sucesso!');
            document.getElementById('addVehicleForm').reset();
        } else {
            alert('Erro ao adicionar carro.');
        }
    } catch (err) { console.error(err); }
});

// 2. CARREGAR E GERIR RESERVAS (A Novidade)
async function carregarReservas() {
    const container = document.getElementById('lista-reservas');
    
    try {
        const res = await fetch('/api/reservas/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const reservas = await res.json();

        container.innerHTML = ''; // Limpar

        reservas.forEach(r => {
            // Definir cor e botões consoante o estado
            let htmlBotoes = '';
            let classeBorda = '';
            let textoEstado = r.estado;

            if (r.estado === 'Pendente') {
                classeBorda = 'status-pendente';
                textoEstado = '⏳ Pendente';
                // Só mostramos botões se estiver Pendente
                htmlBotoes = `
                    <button class="btn btn-mini btn-aprovar" onclick="alterarEstado(${r.id_reserva}, 'Confirmada')">✔ Aprovar</button>
                    <button class="btn btn-mini btn-rejeitar" onclick="alterarEstado(${r.id_reserva}, 'Cancelada')">✖ Rejeitar</button>
                `;
            } else if (r.estado === 'Confirmada') {
                classeBorda = 'status-confirmada';
                textoEstado = '✅ Confirmada';
            } else {
                textoEstado = '❌ ' + r.estado;
            }

            // Criar o cartão da reserva
            const div = document.createElement('div');
            div.className = `reserva-card ${classeBorda}`;
            div.innerHTML = `
                <div>
                    <strong>${r.nome_cliente}</strong> reservou <strong>${r.marca} ${r.modelo}</strong><br>
                    <small>📅 ${new Date(r.data_inicio).toLocaleDateString()} a ${new Date(r.data_fim).toLocaleDateString()}</small><br>
                    <span style="color:#d4af37">${r.valor_total}€</span>
                </div>
                <div style="text-align:right">
                    <div style="margin-bottom:5px; font-weight:bold">${textoEstado}</div>
                    ${htmlBotoes}
                </div>
            `;
            container.appendChild(div);
        });

    } catch (err) {
        container.innerHTML = '<p>Erro ao carregar reservas.</p>';
    }
}

// 3. FUNÇÃO PARA APROVAR/REJEITAR
window.alterarEstado = async (id, novoEstado) => {
    if (!confirm(`Tens a certeza que queres marcar como ${novoEstado}?`)) return;

    try {
        const res = await fetch(`/api/reservas/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ estado: novoEstado })
        });

        if (res.ok) {
            carregarReservas(); // Atualiza a lista automaticamente
        } else {
            alert('Erro ao atualizar.');
        }
    } catch (err) { console.error(err); }
};

// Iniciar a lista ao abrir a página
carregarReservas();
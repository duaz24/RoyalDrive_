let precoDiario = 0;

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const veiculoId = params.get('id');

    if (!veiculoId) {
        window.location.href = 'frota.html';
        return;
    }

    // Configura data mínima para hoje
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('data_inicio').setAttribute('min', hoje);
    document.getElementById('data_fim').setAttribute('min', hoje);

    await carregarDadosVeiculo(veiculoId);
});

async function carregarDadosVeiculo(id) {
    try {
        const resposta = await fetch(`/api/veiculos?v=${new Date().getTime()}`);
        const veiculos = await resposta.json();
        const carro = veiculos.find(v => v.id_veiculo == id);

        if (carro) {
            window.carroSelecionado = carro; // Para o mapa
            precoDiario = parseFloat(carro.preco_base_diario);

            document.getElementById('info-carro').innerHTML = `
                <img src="${carro.imagem_url || 'https://via.placeholder.com/300'}" alt="${carro.modelo}">
                <div class="car-details-info">
                    <h2 style="margin:0;">${carro.marca} ${carro.modelo}</h2>
                    <p style="color: #d4af37; font-weight: bold; margin: 10px 0;">${carro.tipo_nome}</p>
                    <p style="font-size: 0.9rem; color: #aaa;">Preço base: ${precoDiario}€ / dia</p>
                    <hr style="border: 0; border-top: 1px solid #333; margin: 15px 0;">
                    <p>📍 Agência: <strong>${carro.agencia_nome}</strong></p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
    }
}

// Cálculo do Total
function calcularReserva() {
    const inicio = document.getElementById('data_inicio').value;
    const fim = document.getElementById('data_fim').value;
    const display = document.getElementById('valor-total');

    if (inicio && fim && precoDiario > 0) {
        const d1 = new Date(inicio);
        const d2 = new Date(fim);
        const diff = d2 - d1;
        const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (dias > 0) {
            const total = dias * precoDiario;
            display.innerHTML = `Total: <span style="color:#fff">${total.toFixed(2)}€</span> <br><small style="font-size:0.8rem; color:#aaa">${dias} dias selecionados</small>`;
            display.dataset.valor = total;
        } else {
            display.innerHTML = '<span style="color: #ff4444; font-size: 0.9rem;">Data de devolução inválida</span>';
        }
    }
}

document.getElementById('data_inicio').addEventListener('change', calcularReserva);
document.getElementById('data_fim').addEventListener('change', calcularReserva);

// Envio do formulário
document.getElementById('form-reserva').addEventListener('submit', (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const valor = document.getElementById('valor-total').dataset.valor;

    if (!token) {
        alert("Inicie sessão para reservar.");
        window.location.href = 'login.html';
        return;
    }

    if (!valor || valor <= 0) {
        alert("Selecione datas válidas.");
        return;
    }

    const params = new URLSearchParams({
        id_veiculo: window.carroSelecionado.id_veiculo,
        data_inicio: document.getElementById('data_inicio').value,
        data_fim: document.getElementById('data_fim').value,
        valor: valor
    });

    window.location.href = `checkout.html?${params.toString()}`;
});

// Inicialização do Mapa
window.initMapReserva = function() {
    const interval = setInterval(() => {
        if (window.carroSelecionado) {
            clearInterval(interval);
            const coords = { 
                lat: parseFloat(window.carroSelecionado.latitude), 
                lng: parseFloat(window.carroSelecionado.longitude) 
            };

            const map = new google.maps.Map(document.getElementById("map-reserva"), {
                zoom: 15,
                center: coords,
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#212121" }] },
                    { featureType: "road", elementType: "geometry", stylers: [{ color: "#303030" }] }
                ],
                disableDefaultUI: true, // Mapa mais limpo
                zoomControl: true
            });

            new google.maps.Marker({
                position: coords,
                map: map,
                title: window.carroSelecionado.agencia_nome,
                animation: google.maps.Animation.DROP
            });
        }
    }, 100);
};
let todosVeiculos = []; // Guarda a lista completa da API para filtrar localmente

document.addEventListener('DOMContentLoaded', () => {
    verificarLogin();
    inicializarFrota();
});

// --- 1. GESTÃO DE LOGIN E MENU ---
function verificarLogin() {
    const nome = localStorage.getItem('usuario_nome');
    const role = localStorage.getItem('usuario_role');
    const userArea = document.getElementById('user-area');

    if (nome) {
        let html = `<span style="margin-right: 15px; color: #d4af37; font-weight: bold;">Olá, ${nome}</span>`;

        if (role === 'Administrador' || role === 'Admin') {
            html += `
                <button class="btn" style="background-color: #800000; color: white; margin-right: 10px; padding: 5px 15px;" onclick="window.location.href='admin.html'">
                    ⚙️ Admin
                </button>`;
        }

        html += `
            <button class="btn" style="margin-right: 10px; padding: 5px 15px;" onclick="window.location.href='minhas-reservas.html'">Reservas</button>
            <button class="btn" style="background-color: #444; color: white; padding: 5px 15px;" onclick="logout()">Sair</button>`;

        userArea.innerHTML = html;
    } else {
        userArea.innerHTML = `<button class="btn" onclick="window.location.href='login.html'">Login</button>`;
    }
}

function logout() {
    localStorage.clear();
    window.location.reload();
}

// --- 2. CARREGAR E FILTRAR A FROTA ---

async function inicializarFrota() {
    await carregarVeiculos();
    
    // Configurar os eventos dos filtros
    const btnFiltrar = document.getElementById('btn-filtrar');
    const btnLimpar = document.getElementById('btn-limpar');

    if (btnFiltrar) btnFiltrar.addEventListener('click', aplicarFiltros);
    if (btnLimpar) btnLimpar.addEventListener('click', () => {
        document.getElementById('search-text').value = '';
        document.getElementById('filter-categoria').value = 'todos';
        document.getElementById('filter-local').value = 'todos';
        document.getElementById('filter-preco').value = '';
        renderizarCarros(todosVeiculos);
    });
}

async function carregarVeiculos() {
    try {
        const container = document.getElementById('lista-veiculos');
        const resposta = await fetch('/api/veiculos?v=' + new Date().getTime());
        todosVeiculos = await resposta.json();

        renderizarCarros(todosVeiculos);
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('lista-veiculos').innerHTML = '<p style="color: red">Erro ao carregar a frota.</p>';
    }
}

function renderizarCarros(lista) {
    const container = document.getElementById('lista-veiculos');
    container.innerHTML = ''; 

    if (lista.length === 0) {
        container.innerHTML = '<p style="color: #aaa; text-align: center; grid-column: 1/-1; padding: 40px;">Nenhum veículo encontrado com estes critérios.</p>';
        return;
    }

    lista.forEach(carro => {
        const card = document.createElement('div');
        card.className = 'car-card';
        card.innerHTML = `
            <img src="${carro.imagem_url || 'https://via.placeholder.com/300'}" alt="${carro.modelo}" class="car-image">
            <div class="car-title">${carro.marca} ${carro.modelo}</div>
            <div class="car-info">
                <p>📍 ${carro.agencia_nome}</p>
                <p>⚙️ ${carro.tipo_nome} (${carro.ano_fabrico})</p>
            </div>
            <div class="car-price">${carro.preco_base_diario}€ / dia</div>
            <button class="btn" onclick="tentarReservar(${carro.id_veiculo})">Reservar Agora</button>`;
        container.appendChild(card);
    });
}

function aplicarFiltros() {
    const texto = document.getElementById('search-text').value.toLowerCase();
    const categoria = document.getElementById('filter-categoria').value;
    const local = document.getElementById('filter-local').value;
    const precoMax = parseFloat(document.getElementById('filter-preco').value);

    const filtrados = todosVeiculos.filter(carro => {
        const matchTexto = carro.marca.toLowerCase().includes(texto) || carro.modelo.toLowerCase().includes(texto);
        const matchCategoria = categoria === 'todos' || carro.tipo_nome === categoria;
        const matchLocal = local === 'todos' || carro.agencia_nome.includes(local);
        const matchPreco = !precoMax || parseFloat(carro.preco_base_diario) <= precoMax;

        return matchTexto && matchCategoria && matchLocal && matchPreco;
    });

    renderizarCarros(filtrados);
}

// --- 3. LÓGICA DO MAPA ---
window.initMap = async function() {
    const centroPortugal = { lat: 39.5, lng: -8.0 };
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 7,
        center: centroPortugal,
        styles: [
            { elementType: "geometry", stylers: [{ color: "#212121" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] }
        ]
    });

    try {
        const resposta = await fetch('/api/veiculos?v=' + new Date().getTime());
        const veiculos = await resposta.json();
        const agenciasVistas = new Set();

        veiculos.forEach(v => {
            if (!agenciasVistas.has(v.agencia_nome)) {
                const marker = new google.maps.Marker({
                    position: { lat: parseFloat(v.latitude), lng: parseFloat(v.longitude) },
                    map: map,
                    title: v.agencia_nome,
                    animation: google.maps.Animation.DROP
                });

                const info = new google.maps.InfoWindow({
                    content: `<div style="color:black"><strong>Agência RoyalDrive: ${v.agencia_nome}</strong><br>Veículos de luxo disponíveis.</div>`
                });

                marker.addListener("click", () => info.open(map, marker));
                agenciasVistas.add(v.agencia_nome);
            }
        });
    } catch (err) {
        console.error("Erro no mapa:", err);
    }
}

function tentarReservar(idVeiculo) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('⚠️ Para reservar, inicie sessão primeiro.');
        window.location.href = 'login.html';
    } else {
        window.location.href = `reservar.html?id=${idVeiculo}`;
    }
}
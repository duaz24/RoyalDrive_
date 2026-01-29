// public/app.js

let todosVeiculos = []; // Guarda a lista completa da API para filtrar localmente

document.addEventListener('DOMContentLoaded', () => {
    verificarLogin();      // 1. Verifica o menu
    inicializarFrota();    // 2. Carrega os carros
});

// --- 1. GESTÃO DE LOGIN E MENU (ATUALIZADO) ---
function verificarLogin() {
    // Agora lemos o objeto 'user' que guardámos no login.js
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    // Selecionar os elementos do menu pelos IDs novos
    const navLogin = document.getElementById('nav-login');
    const navRegistar = document.getElementById('nav-registar');
    const navReservas = document.getElementById('nav-reservas');
    const navLogout = document.getElementById('nav-logout');

    if (token && user) {
        // --- UTILIZADOR ESTÁ LOGADO ---
        // Esconde botões de entrar
        if (navLogin) navLogin.style.display = 'none';
        if (navRegistar) navRegistar.style.display = 'none';
        
        // Mostra botões de cliente
        if (navReservas) navReservas.style.display = 'inline-block';
        if (navLogout) navLogout.style.display = 'inline-block';

        // Opcional: Se quiseres mostrar o nome nalgum lado (cria um <span id="user-name"> no HTML)
        // const userNameSpan = document.getElementById('user-name');
        // if (userNameSpan) userNameSpan.innerText = `Olá, ${user.nome}`;

    } else {
        // --- VISITANTE (NÃO LOGADO) ---
        // Mostra botões de entrar
        if (navLogin) navLogin.style.display = 'inline-block';
        if (navRegistar) navRegistar.style.display = 'inline-block';
        
        // Esconde botões de cliente
        if (navReservas) navReservas.style.display = 'none';
        if (navLogout) navLogout.style.display = 'none';
    }
}

function logout() {
    // Limpa os dados guardados
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Recarrega a página ou vai para a home
    window.location.href = 'index.html';
}

// --- 2. CARREGAR E FILTRAR A FROTA (MANTIDO IGUAL) ---

async function inicializarFrota() {
    // Só tenta carregar veículos se a lista existir na página (para não dar erro na Home)
    if (!document.getElementById('lista-veiculos')) return;

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
        const container = document.getElementById('lista-veiculos');
        if(container) container.innerHTML = '<p style="color: red">Erro ao carregar a frota.</p>';
    }
}

function renderizarCarros(lista) {
    const container = document.getElementById('lista-veiculos');
    if (!container) return; // Proteção extra

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

// --- 3. LÓGICA DO MAPA (MANTIDO IGUAL) ---
window.initMap = async function() {
    // Se não houver mapa na página, não faz nada
    if (!document.getElementById("map")) return;

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

// --- 4. RESERVAS (MANTIDO IGUAL) ---
function tentarReservar(idVeiculo) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('⚠️ Para reservar, inicie sessão primeiro.');
        window.location.href = 'login.html';
    } else {
        window.location.href = `reservar.html?id=${idVeiculo}`;
    }
}

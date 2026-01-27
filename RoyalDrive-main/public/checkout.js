// 1. CAPTURAR DADOS DA URL
const params = new URLSearchParams(window.location.search);
const idVeiculo = params.get('id_veiculo');
const dataInicio = params.get('data_inicio');
const dataFim = params.get('data_fim');
const valorTotal = params.get('valor');

if (!idVeiculo || !valorTotal) {
    alert("Erro nos dados da reserva. A voltar à frota...");
    window.location.href = 'index.html';
}

// 2. AO CARREGAR A PÁGINA: Preencher o Resumo
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('display-total').textContent = `${parseFloat(valorTotal).toFixed(2)}€`;

    try {
        const res = await fetch(`/api/veiculos/${idVeiculo}`);
        if (!res.ok) throw new Error('Erro ao carregar carro');
        
        const carro = await res.json();
        
        document.getElementById('resumo-conteudo').innerHTML = `
            <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                <img src="${carro.imagem_url}" style="width: 80px; height: 50px; object-fit: cover; border-radius: 4px;">
                <div>
                    <h4 style="margin:0; color:white;">${carro.marca} ${carro.modelo}</h4>
                    <small style="color:#aaa;">${carro.tipo_nome} | ${carro.agencia_nome}</small>
                </div>
            </div>
            <p><strong>📅 Levantamento:</strong> ${new Date(dataInicio).toLocaleDateString()}</p>
            <p><strong>📅 Devolução:</strong> ${new Date(dataFim).toLocaleDateString()}</p>
        `;

    } catch (err) {
        console.error(err);
        document.getElementById('resumo-conteudo').innerHTML = '<p>Erro ao carregar detalhes do carro.</p>';
    }
});

// 3. INTERFACE: Alternar entre Cartão e MB WAY
window.mudarMetodo = (metodo) => {
    const btns = document.querySelectorAll('.method-btn');
    const formCC = document.getElementById('form-cc');
    const formMB = document.getElementById('form-mbway');

    if (metodo === 'cc') {
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
        formCC.style.display = 'block';
        formMB.style.display = 'none';
    } else {
        btns[0].classList.remove('active');
        btns[1].classList.add('active');
        formCC.style.display = 'none';
        formMB.style.display = 'block';
    }
};

// 4. FINALIZAR PAGAMENTO (Com Simulação)
document.getElementById('btn-finalizar').addEventListener('click', async () => {
    const btn = document.getElementById('btn-finalizar');
    const token = localStorage.getItem('token');

    if (!token) {
        alert("Sessão expirada. Faz login novamente.");
        window.location.href = 'login.html';
        return;
    }
    
    // Descobrir qual o método selecionado visualmente
    const isMBWay = document.querySelectorAll('.method-btn')[1].classList.contains('active');
    const metodoSelecionado = isMBWay ? 'MB Way' : 'Cartão de Crédito';

    // Simulação Visual
    btn.disabled = true;
    btn.textContent = 'A processar pagamento...';
    btn.style.backgroundColor = '#444';

    await new Promise(r => setTimeout(r, 1500)); // Suspense de 1.5s

    const dadosReserva = {
        id_veiculo: idVeiculo,
        data_inicio: dataInicio,
        data_fim: dataFim,
        valor_total: valorTotal,
        metodo_pagamento: metodoSelecionado
    };

    try {
        const resposta = await fetch('/api/reservas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dadosReserva)
        });

        if (resposta.ok) {
            const dados = await resposta.json();

            // Sucesso Visual
            btn.style.backgroundColor = '#28a745'; 
            btn.innerHTML = '<strong>Pagamento Aceite!</strong>';
            
            // Mostrar Referência Falsa se existir
            if(dados.payment_info && dados.payment_info.entidade) {
                alert(`✅ Pagamento Simulado com Sucesso!\n\nEntidade: ${dados.payment_info.entidade}\nReferência: ${dados.payment_info.referencia}\nValor: ${valorTotal}€`);
            } else {
                alert('✅ Pagamento (Simulado) efetuado com sucesso!');
            }
            
            // Redirecionar
            setTimeout(() => {
                window.location.href = 'minhas-reservas.html';
            }, 1000);

        } else {
            const erro = await resposta.json();
            alert('Erro: ' + erro.message);
            btn.disabled = false;
            btn.textContent = 'Tentar Novamente';
            btn.style.backgroundColor = '#d4af37';
        }

    } catch (err) {
        console.error(err);
        alert('Erro de conexão ao servidor.');
        btn.disabled = false;
        btn.textContent = 'Erro de Ligação';
    }
});
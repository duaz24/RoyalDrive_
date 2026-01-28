const db = require('../config/db');

// --- 1. CRIAR RESERVA (COM SIMULAÇÃO DE PAGAMENTO) ---
exports.createReservation = async (req, res) => {
    // Agora recebemos também o 'metodo_pagamento' vindo do frontend
    const { id_veiculo, data_inicio, data_fim, valor_total, metodo_pagamento } = req.body;
    const id_utilizador = req.user.id;

    console.log("💳 A iniciar simulação de pagamento Easypay...");

    try {
        // 1. Simular resposta da Easypay (Dados Falsos)
        const transacaoSimulada = {
            id: 'ep_' + Date.now(), // Gera um ID único falso
            method: {
                entity: '12345',
                reference: '123 456 789',
                url: 'https://www.easypay.pt/pagar/simulacao'
            }
        };

        console.log("✅ Pagamento Simulado gerado:", transacaoSimulada.id);

        // 2. Guardar na Base de Dados
        // Definimos o estado como 'Pendente' e guardamos o ID da transação
        const query = `
    INSERT INTO reservas 
    (id_utilizador, id_veiculo, data_inicio, data_fim, valor_total, estado, easypay_transaction_id, metodo_pagamento)
    VALUES (?, ?, ?, ?, ?, 'Pendente', ?, ?)
`;

        // Se o frontend não enviar método, assumimos Cartão de Crédito
        const metodoFinal = metodo_pagamento || 'Cartão de Crédito';

        const [result] = await db.query(query, [
            id_utilizador, 
            id_veiculo, 
            data_inicio, 
            data_fim, 
            valor_total, 
            transacaoSimulada.id, 
            metodoFinal
        ]);

        // 3. Responder ao Frontend com os dados do pagamento
        res.status(201).json({ 
            message: 'Pedido de reserva criado e pagamento simulado!',
            reserva_id: result.insertId,
            payment_info: {
                id: transacaoSimulada.id,
                entidade: transacaoSimulada.method.entity,
                referencia: transacaoSimulada.method.reference
            }
        });

    } catch (error) {
        console.error("❌ Erro ao criar reserva:", error);
        res.status(500).json({ message: 'Erro ao processar reserva simulada.' });
    }
};

// --- 2. MINHAS RESERVAS (Para o Cliente ver as suas) ---
exports.getMyReservations = async (req, res) => {
    const id_utilizador = req.user.id;
    try {
        // Removida a imagem_url temporariamente para testar se o erro é da coluna inexistente
        const query = `
            SELECT r.*, v.marca, v.modelo
            FROM reservas r
            JOIN veiculos v ON r.id_veiculo = v.id_veiculo
            WHERE r.id_utilizador = ?
            ORDER BY r.data_criacao DESC
        `;
        const [rows] = await db.query(query, [id_utilizador]);
        res.json(rows);
    } catch (error) {
        console.error("❌ Erro SQL em getMyReservations:", error);
        res.status(500).json({ message: 'Erro ao buscar histórico.' });
    }
};

// --- 3. TODAS AS RESERVAS (Para o Admin ver tudo) ---
exports.getAllReservations = async (req, res) => {
    try {
        // Garantimos que os JOINs usam as colunas corretas
        const [reservas] = await db.query(`
            SELECT 
                r.id_reserva, 
                r.data_inicio, 
                r.data_fim, 
                r.valor_total, 
                r.estado,
                v.marca, 
                v.modelo, 
                u.nome AS nome_cliente
            FROM reservas r
            INNER JOIN veiculos v ON r.id_veiculo = v.id_veiculo
            INNER JOIN utilizadores u ON r.id_utilizador = u.id_utilizador
            ORDER BY r.data_criacao DESC
        `);
        res.json(reservas);
    } catch (error) {
        console.error("❌ Erro SQL no Admin:", error.message);
        res.status(500).json({ message: 'Erro ao carregar reservas no servidor.' });
    }
};

// --- 4. ATUALIZAR ESTADO (Para o Admin Aprovar/Rejeitar) ---
exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        await db.query('UPDATE reservas SET estado = ? WHERE id_reserva = ?', [estado, id]);
        res.json({ message: `Reserva ${estado} com sucesso!` });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar estado.' });
    }
};

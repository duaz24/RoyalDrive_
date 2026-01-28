const db = require('../config/db');

exports.createReservation = async (req, res) => {
    const { id_veiculo, data_inicio, data_fim, valor_total, metodo_pagamento } = req.body;
    const id_utilizador = req.user.id;
    try {
        const query = `INSERT INTO reservas (id_utilizador, id_veiculo, data_inicio, data_fim, valor_total, estado, metodo_pagamento) VALUES (?, ?, ?, ?, ?, 'Pendente', ?)`;
        const [result] = await db.query(query, [id_utilizador, id_veiculo, data_inicio, data_fim, valor_total, metodo_pagamento || 'Cartão de Crédito']);
        res.status(201).json({ message: 'Reserva criada!', reserva_id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar reserva.' });
    }
};

exports.getMyReservations = async (req, res) => {
    const id_utilizador = req.user.id;
    try {
        const [rows] = await db.query(`
            SELECT r.*, v.marca, v.modelo, v.imagem_url 
            FROM reservas r 
            JOIN veiculos v ON r.id_veiculo = v.id_veiculo 
            WHERE r.id_utilizador = ? 
            ORDER BY r.data_criacao DESC`, [id_utilizador]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar histórico.' });
    }
};

exports.getAllReservations = async (req, res) => {
    try {
        const [reservas] = await db.query(`
            SELECT r.*, v.marca, v.modelo, v.imagem_url, u.nome AS nome_cliente 
            FROM reservas r 
            LEFT JOIN veiculos v ON r.id_veiculo = v.id_veiculo 
            LEFT JOIN utilizadores u ON r.id_utilizador = u.id_utilizador 
            ORDER BY r.data_criacao DESC`);
        console.log("📦 Reservas encontradas:", reservas.length);
        res.json(reservas);
    } catch (error) {
        console.error("ERRO SQL:", error.message);
        res.status(500).json({ message: 'Erro ao carregar reservas.' });
    }
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        await db.query('UPDATE reservas SET estado = ? WHERE id_reserva = ?', [estado, id]);
        res.json({ message: `Reserva ${estado}!` });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar.' });
    }
};

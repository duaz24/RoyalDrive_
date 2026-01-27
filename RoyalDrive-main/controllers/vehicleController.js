const db = require('../config/db');

// --- 1. LISTAR TODOS OS VEÍCULOS (Para a página inicial) ---
exports.getAllVehicles = async (req, res) => {
    try {
        const query = `
            SELECT 
                v.*, 
                t.nome AS tipo_nome, 
                t.preco_base_diario,
                a.nome AS agencia_nome,
                a.latitude,
                a.longitude
            FROM veiculos v
            JOIN tipos_veiculo t ON v.id_tipo_veiculo = t.id_tipo_veiculo
            JOIN agencias a ON v.id_agencia_atual = a.id_agencia
        `;

        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Erro ao buscar veículos:", error);
        res.status(500).json({ message: 'Erro ao carregar a frota.' });
    }
};

// --- 2. OBTER DETALHES DE UM VEÍCULO (Para a página de reserva) ---
exports.getVehicleById = async (req, res) => {
    const vehicleId = req.params.id;

    try {
        const query = `
            SELECT 
                v.*, 
                t.nome AS tipo_nome, 
                t.caracteristicas, 
                t.preco_base_diario, 
                a.nome AS agencia_nome,
                a.latitude,  -- ADICIONADO
                a.longitude  -- ADICIONADO
            FROM veiculos v
            JOIN tipos_veiculo t ON v.id_tipo_veiculo = t.id_tipo_veiculo
            JOIN agencias a ON v.id_agencia_atual = a.id_agencia
            WHERE v.id_veiculo = ?
        `;

        const [rows] = await db.query(query, [vehicleId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Veículo não encontrado.' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Erro ao buscar veículo:", error);
        res.status(500).json({ message: 'Erro ao carregar detalhes do veículo.' });
    }
};

// --- 3. CRIAR NOVO VEÍCULO (Para o Painel Admin) ---
exports.createVehicle = async (req, res) => {
    // Receber os dados do formulário
    const { matricula, marca, modelo, ano_fabrico, cor, id_tipo_veiculo, id_agencia_atual, imagem_url } = req.body;

    try {
        // Inserir na base de dados (Definimos estado='Disponível' e km=0 por defeito)
        const query = `
            INSERT INTO veiculos 
            (matricula, marca, modelo, ano_fabrico, cor, id_tipo_veiculo, id_agencia_atual, estado, quilometragem, imagem_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Disponível', 0, ?)
        `;

        await db.query(query, [
            matricula, 
            marca, 
            modelo, 
            ano_fabrico, 
            cor, 
            id_tipo_veiculo, 
            id_agencia_atual, 
            imagem_url
        ]);

        res.status(201).json({ message: 'Carro adicionado à frota com sucesso!' });

    } catch (error) {
        console.error("Erro ao criar veículo:", error);
        res.status(500).json({ message: 'Erro ao criar veículo.' });
    }
};
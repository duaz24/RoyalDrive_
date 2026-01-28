const db = require('../config/db');

// Método 1: Listar todas as agências (Útil para saber onde estão as filiais)
exports.getAgencias = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT nome, morada, telefone, email FROM agencias');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao consultar agências" });
    }
};

// Método 2: Listar estatísticas da frota (Exemplo de dado complexo/agregado)
exports.getFrotaStats = async (req, res) => {
    try {
        const query = `
            SELECT t.nome as categoria, COUNT(v.id_veiculo) as quantidade, AVG(t.preco_base_diario) as preco_medio
            FROM tipos_veiculo t
            LEFT JOIN veiculos v ON t.id_tipo_veiculo = v.id_tipo_veiculo
            GROUP BY t.nome`;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao consultar estatísticas" });
    }
};

// Método 3: Listar veículos disponíveis (Apenas dados básicos)
// No ficheiro controllers/publicApiController.js

exports.getVeiculosDisponiveis = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT marca, modelo, cor FROM veiculos LIMIT 10');
        res.json(rows);
    } catch (error) {
        console.error(error); // Isto ajuda-te a ver o erro real na consola do Render
        res.status(500).json({ erro: "Erro ao consultar veículos", detalhe: error.message });
    }
};

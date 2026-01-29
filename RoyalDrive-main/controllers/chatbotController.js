// controllers/chatbotController.js
const db = require('../config/db');
exports.processMessage = async (req, res) => {
    const userMessage = req.body.message.toLowerCase();
    let botResponse = "";

    try {
        // Lógica simples de palavras-chave
        if (userMessage.includes('ola') || userMessage.includes('olá') || userMessage.includes('bom dia')) {
            botResponse = "Olá! Bem-vindo à RoyalDrive. Posso ajudar-te a ver a nossa frota, agências ou contactos.";
        
        } else if (userMessage.includes('carros') || userMessage.includes('frota') || userMessage.includes('veículos')) {
            // Busca carros disponíveis na BD
            const [rows] = await db.query("SELECT marca, modelo, preco_base_diario FROM veiculos WHERE estado = 'Disponível' LIMIT 3");
            
            if (rows.length > 0) {
                const lista = rows.map(c => `🚗 ${c.marca} ${c.modelo} (${c.preco_base_diario}€/dia)`).join('<br>');
                botResponse = `Temos estas máquinas disponíveis:<br>${lista}<br><a href='/frota.html'>Ver toda a frota</a>`;
            } else {
                botResponse = "De momento estamos com a frota toda reservada! Tenta mais tarde.";
            }

        } else if (userMessage.includes('agencia') || userMessage.includes('local') || userMessage.includes('morada')) {
            // Busca agências na BD
            const [rows] = await db.query("SELECT nome, morada FROM agencias");
            const lista = rows.map(a => `📍 <strong>${a.nome}:</strong> ${a.morada}`).join('<br>');
            botResponse = `Podes encontrar-nos aqui:<br>${lista}`;

        } else if (userMessage.includes('contacto') || userMessage.includes('email') || userMessage.includes('telefone')) {
             botResponse = "Podes contactar-nos pelo email <strong>geral@royaldrive.pt</strong> ou visitar a página de <a href='/contacto.html'>Contactos</a>.";

        } else {
            botResponse = "Desculpa, não entendi. Tenta perguntar por 'carros', 'agências' ou 'contactos'.";
        }

        res.json({ response: botResponse });

    } catch (error) {
        console.error("Erro no Chatbot:", error);
        res.status(500).json({ response: "Tive um erro interno. Tenta novamente." });
    }
};

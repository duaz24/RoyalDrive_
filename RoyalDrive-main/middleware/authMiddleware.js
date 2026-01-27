const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Tentar ler o token do cabeçalho
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        console.log("⛔ [Middleware] Acesso negado: Token não encontrado.");
        return res.status(401).json({ message: 'Acesso negado. Token em falta.' });
    }

    try {
        // 2. Verificar se a chave é válida
        // ATENÇÃO: Tem de ser igual à usada no authController.js
        const decoded = jwt.verify(token, 'segredo_super_secreto');
        
        // 3. Guardar os dados do utilizador no pedido
        req.user = decoded;
        
        console.log(`✅ [Middleware] Token VÁLIDO para o user ID: ${req.user.id} (Role: ${req.user.role})`);
        next(); // Deixa passar

    } catch (error) {
        console.log("❌ [Middleware] Token INVÁLIDO:", error.message);
        res.status(400).json({ message: 'Token inválido.' });
    }
};
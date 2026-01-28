const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Tentar ler o token do cabeçalho
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
        console.log("⛔ [Middleware] Acesso negado: Token não encontrado.");
        return res.status(401).json({ message: 'Acesso negado. Token em falta.' });
    }

    try {
        // 2. Definir a chave secreta (Tem de ser IGUAL em todo o lado)
        // Tentamos ler do Render (process.env) ou usamos a tua nova chave padrão
        const secretKey = process.env.JWT_SECRET || 'segredo_super_secreto_royal';

        // 3. Verificar o token
        const decoded = jwt.verify(token, secretKey);
        
        // 4. Guardar os dados do utilizador no pedido (incluindo a role)
        req.user = decoded;
        
        console.log(`✅ [Middleware] Token VÁLIDO para o user ID: ${req.user.id} (Role: ${req.user.role})`);
        next(); 

    } catch (error) {
        console.log("❌ [Middleware] Token INVÁLIDO:", error.message);
        // Se o erro for assinatura, avisamos para fazer novo login
        const msg = error.name === 'JsonWebTokenError' ? 'Sessão inválida. Faça login novamente.' : 'Token expirado.';
        res.status(401).json({ message: msg });
    }
};

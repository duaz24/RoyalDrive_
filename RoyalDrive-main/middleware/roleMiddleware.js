module.exports = (rolesPermitidas) => {
    return (req, res, next) => {
        // 1. Verificar se o utilizador existe no pedido (vem do authMiddleware)
        if (!req.user || !req.user.role) {
            console.log("⛔ [Acesso Negado] Utilizador sem cargo definido.");
            return res.status(403).json({ message: "Acesso negado. Faça login novamente." });
        }

        // 2. Normalizar a role (tirar espaços e por em minúsculas para comparar)
        const userRole = req.user.role.trim();
        const rolesNormalizadas = rolesPermitidas.map(r => r.toLowerCase());

        console.log(`🕵️ Verificando permissão: User tem '${userRole}' | Necessário: ${rolesPermitidas}`);

        // 3. Comparação flexível
        const temPermissao = rolesNormalizadas.includes(userRole.toLowerCase());

        if (!temPermissao) {
            console.log(`❌ [Acesso Negado] O cargo '${userRole}' não tem permissão para esta área.`);
            return res.status(403).json({ message: "Erro: Verifique se é Administrador." });
        }

        console.log("✅ [Acesso Concedido] Permissão confirmada.");
        next();
    };
};

// middleware/roleMiddleware.js
module.exports = (rolesPermitidas) => {
    return (req, res, next) => {
        // O req.user foi preenchido pelo TEU authMiddleware anterior
        if (!req.user || !rolesPermitidas.includes(req.user.role)) {
            console.log(`⛔ [Acesso Negado] User ${req.user.id} com Role ${req.user.role} tentou aceder a uma rota restrita.`);
            return res.status(403).json({ message: 'Acesso negado: Não tens permissões de Administrador.' });
        }
        next();
    };
};

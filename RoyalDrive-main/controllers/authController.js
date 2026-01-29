const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. ADICIONA ISTO NO TOPO (Linha 4)
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("87622514862-o3hlv3errl0umue53b8mffevgmpttvin.apps.googleusercontent.com"); 

// ... (mantém o código de registo e login normal igual) ...

// 2. ADICIONA ESTA NOVA FUNÇÃO NO FINAL (Antes do exports.getMe ou no fim do ficheiro)
exports.googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        // Verificar o token com a Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "87622514862-o3hlv3errl0umue53b8mffevgmpttvin.apps.googleusercontent.com", // O mesmo ID de cima
        });
        const payload = ticket.getPayload();
        const { email, name, sub } = payload; 

        // Verificar se o utilizador já existe
        const [users] = await db.query('SELECT * FROM utilizadores WHERE email = ?', [email]);
        let user = users[0];

        if (!user) {
            // Se não existe, cria conta (password NULL)
            const [result] = await db.query(
                'INSERT INTO utilizadores (nome, email, password_hash, role) VALUES (?, ?, ?, ?)', 
                [name, email, null, 'Cliente']
            );
            user = { id_utilizador: result.insertId, nome: name, email: email, role: 'Cliente' };
        }

        // Gerar o nosso Token JWT
        const tokenJwt = jwt.sign(
            { id: user.id_utilizador, role: user.role }, 
            process.env.JWT_SECRET || 'segredo_super_secreto_royal', 
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login Google com sucesso!',
            token: tokenJwt,
            user: {
                id: user.id_utilizador,
                nome: user.nome,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Erro Google:", error);
        res.status(401).json({ message: 'Token Google inválido.' });
    }
};

// ... (mantém o exports.getMe igual)
exports.getMe = async (req, res) => {
    res.json(req.user);
};

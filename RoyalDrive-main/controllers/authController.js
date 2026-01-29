const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("87622514862-o3hlv3errl0umue53b8mffevgmpttvin.apps.googleusercontent.com");
// --- APENAS LOGIN GOOGLE ---
exports.googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        // 1. Verificar o token com a Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "87622514862-o3hlv3errl0umue53b8mffevgmpttvin.apps.googleusercontent.com",
        });
        const payload = ticket.getPayload();
        const { email, name } = payload; 

        // 2. Verificar se o utilizador já existe na nossa base de dados
        const [users] = await db.query('SELECT * FROM utilizadores WHERE email = ?', [email]);
        let user = users[0];

        // 3. Se não existir, criar conta automaticamente (sem password_hash)
        if (!user) {
            const [result] = await db.query(
                'INSERT INTO utilizadores (nome, email, role) VALUES (?, ?, ?)', 
                [name, email, 'Cliente']
            );
            user = { id_utilizador: result.insertId, nome: name, email: email, role: 'Cliente' };
        }

        // (Opcional) Atualizar data do último login
        await db.query('UPDATE utilizadores SET ultimo_login = NOW() WHERE id_utilizador = ?', [user.id_utilizador]);

        // 4. Gerar o nosso Token JWT para a sessão
        const tokenJwt = jwt.sign(
            { id: user.id_utilizador, role: user.role }, 
            process.env.JWT_SECRET || 'segredo_super_secreto_royal', 
            { expiresIn: '1h' }
        );

        // 5. Enviar resposta de sucesso
        res.json({
            message: 'Login Google efetuado com sucesso!',
            token: tokenJwt,
            user: {
                id: user.id_utilizador,
                nome: user.nome,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Erro Google Login:", error);
        res.status(401).json({ message: 'Falha na autenticação com o Google.' });
    }
};

// --- OBTER DADOS DO UTILIZADOR (Mantém-se) ---
exports.getMe = async (req, res) => {
    res.json(req.user);
};

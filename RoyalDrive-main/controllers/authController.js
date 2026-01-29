const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("87622514862-o3hlv3errl0umue53b8mffevgmpttvin.apps.googleusercontent.com");

// --- REGISTO (Cria conta com email e password) ---
exports.register = async (req, res) => {
    const { nome, email, password } = req.body;

    try {
        const [existing] = await db.query('SELECT * FROM utilizadores WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Este email já está registado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query('INSERT INTO utilizadores (nome, email, password_hash, role) VALUES (?, ?, ?, ?)', 
            [nome, email, hashedPassword, 'Cliente']);

        res.status(201).json({ message: 'Registo efetuado com sucesso!' });

    } catch (error) {
        console.error("Erro no registo:", error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// --- LOGIN NORMAL (Email e Password) ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM utilizadores WHERE TRIM(email) = TRIM(?)', [email]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'Email não encontrado.' });
        }

        const user = users[0];

        // Se o user foi criado com Google, não tem password
        if (!user.password_hash) {
            return res.status(400).json({ message: 'Esta conta usa Login Google. Por favor clica no botão do Google.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Password errada.' });
        }

        const token = jwt.sign(
            { id: user.id_utilizador, role: user.role }, 
            process.env.JWT_SECRET || 'segredo_super_secreto_royal', 
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login com sucesso!',
            token: token,
            user: {
                id: user.id_utilizador,
                nome: user.nome,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Erro Login:", error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};

// --- LOGIN GOOGLE (NOVO) ---
exports.googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "87622514862-o3hlv3errl0umue53b8mffevgmpttvin.apps.googleusercontent.com",
        });
        const payload = ticket.getPayload();
        const { email, name } = payload; 

        // Verificar se já existe
        const [users] = await db.query('SELECT * FROM utilizadores WHERE email = ?', [email]);
        let user = users[0];

        if (!user) {
            // Cria conta sem password (null)
            const [result] = await db.query(
                'INSERT INTO utilizadores (nome, email, password_hash, role) VALUES (?, ?, ?, ?)', 
                [name, email, null, 'Cliente']
            );
            user = { id_utilizador: result.insertId, nome: name, email: email, role: 'Cliente' };
        }

        // Gera token
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

// --- OBTER DADOS DO UTILIZADOR ---
exports.getMe = async (req, res) => {
    res.json(req.user);
};

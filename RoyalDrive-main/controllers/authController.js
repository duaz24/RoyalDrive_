const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- REGISTO ---
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

// --- LOGIN (VERSÃO ROBUSTA) ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Busca o utilizador (usamos TRIM para limpar espaços invisíveis no email)
        const [users] = await db.query('SELECT * FROM utilizadores WHERE TRIM(email) = TRIM(?)', [email]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'Email não encontrado.' });
        }

        const user = users[0];

        // 2. Comparação da Password
        // O user.password_hash deve vir exatamente da tua BD
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Password errada.' });
        }

        // 3. Geração do Token
        // Usamos a chave do Render: "segredo_super_secreto_royal"
        const secret = process.env.JWT_SECRET || 'segredo_super_secreto_royal';
        
        const token = jwt.sign(
            { id: user.id_utilizador, role: user.role }, 
            secret, 
            { expiresIn: '1h' }
        );

        // 4. Resposta
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
        console.error("Erro Crítico no Login:", error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.getMe = async (req, res) => {
    res.json(req.user);
};

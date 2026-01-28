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

        // Nota: Aqui usamos 'password_hash' para bater certo com a tua BD
        await db.query('INSERT INTO utilizadores (nome, email, password_hash, role) VALUES (?, ?, ?, ?)', 
            [nome, email, hashedPassword, 'Cliente']);

        res.status(201).json({ message: 'Registo efetuado com sucesso!' });

    } catch (error) {
        console.error("Erro no registo:", error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// --- LOGIN (CORRIGIDO) ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM utilizadores WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'Email não encontrado.' });
        }

        const user = users[0];

        // --- A CORREÇÃO ESTÁ AQUI EM BAIXO ---
        // Agora usamos 'user.password_hash' porque é esse o nome na tua BD!
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Password errada.' });
        }

        // Gerar o Token
       const token = jwt.sign(
    { id: user.id_utilizador, role: user.role }, 
    process.env.JWT_SECRET || 'segredo_super_secreto_royal', // Tenta usar o do Render, se não houver usa o padrão
    { expiresIn: '1h' }
        );

        // Enviar resposta
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
        console.error("Erro no Login:", error);
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

exports.getMe = async (req, res) => {
    res.json(req.user);
};

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- REGISTO ---
exports.register = async (req, res) => {
    const { nome, email, password } = req.body;

    try {
        // Verificar se o utilizador já existe
        const [existing] = await db.query('SELECT * FROM utilizadores WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Este email já está registado.' });
        }

        // Encriptar a password antes de guardar
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserir na base de dados usando o nome correto da coluna: password_hash
        await db.query(
            'INSERT INTO utilizadores (nome, email, password_hash, role) VALUES (?, ?, ?, ?)', 
            [nome, email, hashedPassword, 'Cliente']
        );

        res.status(201).json({ message: 'Registo efetuado com sucesso!' });

    } catch (error) {
        console.error("Erro no registo:", error);
        res.status(500).json({ message: 'Erro no servidor ao registar.' });
    }
};

// --- LOGIN ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Procurar o utilizador pelo email
        const [users] = await db.query('SELECT * FROM utilizadores WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'Email não encontrado.' });
        }

        const user = users[0];

        // Comparar a password enviada com o hash guardado na BD
        // Importante: usamos user.password_hash conforme a estrutura da tua tabela
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Password errada.' });
        }

        // GERAR O TOKEN JWT
        // Aqui usamos a variável de ambiente definida no Render
        const token = jwt.sign(
            { id: user.id_utilizador, role: user.role }, 
            process.env.JWT_SECRET || 'segredo_super_secreto_royal', 
            { expiresIn: '1h' }
        );

        // Enviar resposta com o token e dados básicos do utilizador
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
        res.status(500).json({ message: 'Erro no servidor ao processar login.' });
    }
};

// --- OBTER DADOS DO UTILIZADOR ATUAL ---
exports.getMe = async (req, res) => {
    // req.user é preenchido pelo authMiddleware após validar o token
    res.json(req.user);
};

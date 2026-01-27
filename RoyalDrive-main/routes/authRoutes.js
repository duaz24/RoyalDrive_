const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Rota para REGISTAR novos utilizadores (A novidade!)
router.post('/register', authController.register);

// Rota para fazer LOGIN
router.post('/login', authController.login);

// Rota para obter dados do utilizador atual (usado para verificar sessões)
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
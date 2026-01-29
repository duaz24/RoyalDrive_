const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Registar conta normal
router.post('/register', authController.register);

// Login normal
router.post('/login', authController.login);

// Login com Google
router.post('/google', authController.googleLogin);

// Obter dados do user logado
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;

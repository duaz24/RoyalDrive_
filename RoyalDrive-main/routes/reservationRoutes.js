const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware'); // <--- NOVO

// Rotas de Cliente
router.post('/', authMiddleware, reservationController.createReservation);
router.get('/me', authMiddleware, reservationController.getMyReservations);

// Rotas de Admin (Protegidas com checkRole)
router.get('/all', authMiddleware, checkRole(['Administrador', 'GestorAgencia', 'Admin']), reservationController.getAllReservations);
router.put('/:id/status', authMiddleware, checkRole(['Administrador']), reservationController.updateStatus);

module.exports = router;

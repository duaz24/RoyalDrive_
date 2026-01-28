const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Rota para o Cliente ver as suas próprias reservas (Usa getMyReservations)
router.get('/my', authMiddleware, reservationController.getMyReservations);

// Rota para o Admin ver todas as reservas (Usa getAllReservations)
router.get('/all', authMiddleware, roleMiddleware(['Administrador']), reservationController.getAllReservations);

// Rota para criar reserva
router.post('/', authMiddleware, reservationController.createReservation);

// Rota para atualizar estado (Aprovar/Recusar)
router.put('/:id/status', authMiddleware, roleMiddleware(['Administrador']), reservationController.updateStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware'); // <--- ADICIONAR
const checkRole = require('../middleware/roleMiddleware');      // <--- ADICIONAR

router.get('/', vehicleController.getAllVehicles);
router.get('/:id', vehicleController.getVehicleById);

// Só Admin pode criar veículos
router.post('/', authMiddleware, roleMiddleware(['Administrador', 'Admin']), vehicleController.createVehicle);
module.exports = router;

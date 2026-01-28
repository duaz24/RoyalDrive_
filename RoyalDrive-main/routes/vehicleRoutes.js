const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware'); 
const roleMiddleware = require('../middleware/roleMiddleware'); // Alterado de checkRole para roleMiddleware

router.get('/', vehicleController.getAllVehicles);
router.get('/:id', vehicleController.getVehicleById);

// Só Admin ou Administrador pode criar veículos
router.post('/', authMiddleware, roleMiddleware(['Administrador', 'Admin']), vehicleController.createVehicle);

module.exports = router;

const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicApiController');

// Endpoints acessíveis externamente sem login
router.get('/agencias', publicController.getAgencias);
router.get('/estatisticas', publicController.getFrotaStats);
router.get('/disponibilidade', publicController.getVeiculosDisponiveis);

module.exports = router;

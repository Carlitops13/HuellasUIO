const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { requireAuth, authorizeRoles } = require('../middleware/auth');


router.post('/buscar-crear', requireAuth, chatController.buscarOCrearChat); // Ruta para buscar o crear un chat entre dos usuarios

module.exports = router;
const express = require('express');
const router = express.Router();
const perfilesController = require('../controllers/perfiles.controller');
const { requireAuth } = require('../middleware/auth');

//Rutas protegidas para obtener y actualizar perfil
//router.get('/mi-perfil', requireAuth, perfilesController.obtenerMiPerfil);
//router.put('/mi-perfil', requireAuth, perfilesController.actualizarMiPerfil);

module.exports = router;
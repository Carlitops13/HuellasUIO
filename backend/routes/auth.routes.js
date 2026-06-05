const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

//Rutas de registro, login y logout
router.post('/register', authController.registro);
router.post('/login', authController.login);

//Logout necesita token de Supabase para cerrar sesión
router.post('/logout', requireAuth, authController.logout);

//Actualizar contraseña necesita autenticación
router.post('/update-password', requireAuth, authController.actualizarPassword);

// Recuperar contraseña
router.post('/recuperarClave', authController.recuperarClave);

// Confirmar recuperación de contraseña
router.put('/recuperarClave/confirm', authController.confirmarRecuperarClave);

module.exports = router;
    
    
    
    
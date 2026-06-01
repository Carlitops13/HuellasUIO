const express = require('express');
const router = express.Router();
const authController = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth');

//USUARIOS RESCATISTAS
router.get(`/rescatista/viewProfile`,(req, res) => {
  res.json({ message: 'Ruta para obtener perfil de usuario rescatista - en desarrollo' });
});

router.put(`/rescatista/updateProfile`,(req, res) => {
  res.json({ message: 'Ruta para actualizar perfil de usuario rescatista - en desarrollo' });
});

router.delete(`/rescatista/deleteProfile`,(req, res) => {
  res.json({ message: 'Ruta para eliminar perfil de usuario rescatista - en desarrollo' });
});

//USUARIOS ADOPTANTES AUTENTICADOS
router.get(`/adoptante/viewProfile`,(req, res) => {
  res.json({ message: 'Ruta para obtener perfil de usuario adoptante - en desarrollo' });
});

router.put(`/adoptante/updateProfile`,(req, res) => {
  res.json({ message: 'Ruta para actualizar perfil de usuario adoptante - en desarrollo' });
});

router.delete(`/adoptante/deleteProfile`,(req, res) => {
  res.json({ message: 'Ruta para eliminar perfil de usuario adoptante - en desarrollo' });
});

module.exports = router;
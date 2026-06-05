const express = require('express');
const router = express.Router();
const authController = require('../controllers/user.controller');
const { requireAuth , authorizeRoles} = require('../middleware/auth');
const perfilesController = require('../controllers/perfiles.controller');

//USUARIOS RESCATISTAS
router.get(`/rescatista/viewProfile`,requireAuth, authorizeRoles("rescatista"),(req, res) => {
  res.json({ message: 'Ruta para obtener perfil de usuario rescatista - en desarrollo' });
});

router.put(`/rescatista/updateProfile`,requireAuth, authorizeRoles("rescatista"),(req, res) => {
  res.json({ message: 'Ruta para actualizar perfil de usuario rescatista - en desarrollo' });
});

router.delete(`/rescatista/deleteProfile`,requireAuth, authorizeRoles("rescatista"),(req, res) => {
  res.json({ message: 'Ruta para eliminar perfil de usuario rescatista - en desarrollo' });
});

//USUARIOS ADOPTANTES AUTENTICADOS
router.get(`/adoptante/viewProfile`,requireAuth,perfilesController.obtenerMiPerfil);

router.put(`/adoptante/updateProfile`,requireAuth,perfilesController.actualizarMiPerfil);

router.delete(`/adoptante/deleteProfile`,requireAuth, authorizeRoles("adoptante"),(req, res) => {
  res.json({ message: 'Ruta para eliminar perfil de usuario adoptante - en desarrollo' });
});

router.post('/adoptante/adoptionRequest', requireAuth, authorizeRoles("adoptante"), (req, res) => {
  res.json({ message: 'Ruta para enviar solicitud de adopción - en desarrollo' });
});

router.get('/adoptante/viewAdoptionStatus', requireAuth, authorizeRoles("adoptante"), (req, res) => {
  res.json({ message: 'Ruta para ver estado de solicitud de adopción - en desarrollo' });
});

module.exports = router;
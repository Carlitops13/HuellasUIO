const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const perfilesController = require('../controllers/perfiles.controller');
const chatController = require('../controllers/chat.controller');
const { requireAuth, authorizeRoles } = require('../middleware/auth');

// ================= RUTAS PARA USUARIOS RESCATISTAS =================

// Obtener perfil de rescatista (se reutiliza obtenerMiPerfil)
router.get('/rescatista/viewProfile', requireAuth, authorizeRoles("rescatista"), perfilesController.obtenerMiPerfil);

// Actualizar perfil de rescatista (se reutiliza actualizarMiPerfil)
router.put('/rescatista/updateProfile', requireAuth, authorizeRoles("rescatista"), perfilesController.actualizarMiPerfil);

// Eliminar perfil de rescatista
router.delete('/rescatista/deleteProfile', requireAuth, authorizeRoles("rescatista"), userController.eliminarMiPerfil);

// Ver solicitudes de adopción recibidas para sus rescatados
router.get('/rescatista/solicitudesRecibidas', requireAuth, authorizeRoles("rescatista"), userController.verSolicitudesRecibidas);

// Responder a una solicitud de adopción (aprobar, rechazar o poner en revisión)
router.put('/rescatista/responderSolicitud/:idSolicitud', requireAuth, authorizeRoles("rescatista"), userController.responderSolicitud);


// ================= RUTAS PARA USUARIOS ADOPTANTES =================

// Obtener perfil de adoptante
router.get('/adoptante/viewProfile', requireAuth, authorizeRoles("adoptante"), perfilesController.obtenerMiPerfil);

// Actualizar perfil de adoptante
router.put('/adoptante/updateProfile', requireAuth, authorizeRoles("adoptante"), perfilesController.actualizarMiPerfil);

router.delete(`/adoptante/deleteProfile`,requireAuth, authorizeRoles("adoptante"),userController.eliminarMiPerfil);

router.post('/adoptante/adoptionRequest', requireAuth, authorizeRoles("adoptante"),userController.postularAdopcion);

router.get('/adoptante/viewAdoptionStatus', requireAuth, authorizeRoles("adoptante"), userController.verEstadoPostulaciones);

router.get('/adoptante/myAdoptionRequests', requireAuth, authorizeRoles("adoptante"), userController.verMisSolicitudes);

// Obtener perfil genérico de cualquier usuario autenticado (para resolver el rol desde la base de datos)
router.get('/profile', requireAuth, perfilesController.obtenerMiPerfil);

module.exports = router;
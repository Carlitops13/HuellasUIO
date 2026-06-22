const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireAuth, authorizeRoles } = require('../middleware/auth');

// Todas las rutas de administración requieren autenticación y rol de administrador
const adminAuth = [requireAuth, authorizeRoles('admin_fundacion')];

// Gestión de Usuarios
router.get('/viewUsers', adminAuth, adminController.viewUsers);
router.get('/searchUser/:id', adminAuth, adminController.searchUser);
router.post('/createUser', adminAuth, adminController.createUser);
router.put('/updateUser/:id', adminAuth, adminController.updateUser);
router.delete('/deleteUser/:id', adminAuth, adminController.deleteUser);
router.put('/suspendAccount/:id', adminAuth, adminController.suspendAccount);

// Gestión de Mascotas
router.get('/viewPets', adminAuth, adminController.viewPets);
router.delete('/deletePets/:id', adminAuth, adminController.deletePets);

// Gestión y Auditoría de Adopciones
router.get('/viewStateAdoption', adminAuth, adminController.viewStateAdoption);
router.get('/viewStateAdoption/:id', adminAuth, adminController.viewStateAdoptionById);

module.exports = router;
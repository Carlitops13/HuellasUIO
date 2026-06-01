const express = require('express');
const router = express.Router();
const authController = require('../controllers/admin.controller');
const { requireAuth } = require('../middleware/auth');

//usuarios
router.get('/viewUsers', (req, res) => {
  res.json({ message: 'Ruta para listar usuarios y tipo de cuenta - en desarrollo' });
});

router.delete('/deleteUser/:id', (req, res) => {
  res.json({ message: `Ruta para eliminar usuario con ID ${req.params.id} - en desarrollo` });
});

router.put('/updateUser/:id', (req, res) => {
  res.json({ message: `Ruta para actualizar usuario con ID ${req.params.id} - en desarrollo` });
});

router.post('/createUser', (req, res) => {
  res.json({ message: 'Ruta para registrar usuario - en desarrollo' });
});

router.get('/searchUser/:id', (req, res) => {
  res.json({ message: `Ruta para obtener usuario con ID ${req.params.id} - en desarrollo` });
});

router.put('/suspendAccount/:id', (req, res) => {
  res.json({ message: `Ruta para suspender cuenta de usuario con ID ${req.params.id} - en desarrollo` });
});

//mascotas
router.get('/viewPets', (req, res) => {
  res.json({ message: 'Ruta para listar mascotas - en desarrollo' });
});

router.delete('/deletePets/:id', (req, res) => {
  res.json({ message: `Ruta para eliminar mascota con ID ${req.params.id} - en desarrollo` });
});

router.get('/viewStateAdoption', (req, res) => {
  res.json({ message: 'Ruta para listar estado de adopción - en desarrollo' });
});

router.get('/viewStateAdoption/:id', (req, res) => {
  res.json({ message: `Ruta para obtener estado de adopción con ID ${req.params.id} - en desarrollo` });
});




//router.get('/usuarios', requireAuth, adminController.listarUsuarios);
//router.delete('/usuarios/:id', requireAuth, adminController.eliminarUsuario);
//router.put('/usuarios/:id', requireAuth, adminController.actualizarUsuario);
//router.post('/usuarios/registrar', requireAuth, adminController.registrarUsuarios);
//router.get('/usuarios/:id', requireAuth, adminController.obtenerUsuario);
module.exports = router;
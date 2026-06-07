const express = require('express');
const router = express.Router();
const { requireAuth, authorizeRoles } = require('../middleware/auth');

//mascotas
router.get('/viewOurPets', requireAuth, authorizeRoles("rescatista"),(req, res) => {
  res.json({ message: 'Ruta para listar mascotas del rescatista - en desarrollo' });
});

router.post('/addPet', requireAuth, authorizeRoles("rescatista"), (req, res) => {
  res.json({ message: 'Ruta para agregar mascota del rescatista - en desarrollo' });
});

router.delete('/deletePet/:id', requireAuth, authorizeRoles("rescatista"), (req, res) => {
  res.json({ message: `Ruta para eliminar mascota del rescatista con ID ${req.params.id} - en desarrollo` });
});

router.put('/updatePet/:id', requireAuth, authorizeRoles("rescatista"), (req, res) => {
  res.json({ message: `Ruta para actualizar mascota del rescatista con ID ${req.params.id} - en desarrollo` });
});

router.get('/viewOurPet/:id', requireAuth, authorizeRoles("rescatista"), (req, res) => {
  res.json({ message: `Ruta para obtener mascota del rescatista con ID ${req.params.id} - en desarrollo` });
});

//mascotas
router.get('/viewAllPets', (req, res) => {
  res.json({ message: 'Ruta para listar todas las mascotas - en desarrollo' });
});

router.get('/viewAllPet/:id', (req, res) => {
  res.json({ message: `Ruta para obtener mascota con ID ${req.params.id} - en desarrollo` });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const petsController = require('../controllers/pets.controller');
const { requireAuth, authorizeRoles } = require('../middleware/auth');
const multer = require('multer');

// Configuración de multer para subir archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // Máximo 5MB
  }
});

// Rutas privadas para Rescatistas
router.get('/viewOurPets', requireAuth, authorizeRoles("rescatista"), petsController.viewOurPets);
router.post('/addPet', requireAuth, authorizeRoles("rescatista"), petsController.addPet);
router.delete('/deletePet/:id', requireAuth, authorizeRoles("rescatista"), petsController.deletePet);
router.put('/updatePet/:id', requireAuth, authorizeRoles("rescatista"), petsController.updatePet);
router.get('/viewOurPet/:id', requireAuth, authorizeRoles("rescatista"), petsController.viewOurPet);

// Subida de foto de mascota (solo rescatistas)
router.post('/upload', requireAuth, authorizeRoles("rescatista"), upload.single('imagen'), petsController.uploadPetImage);

// Rutas Públicas
router.get('/viewAllPets', petsController.viewAllPets);
router.get('/viewAllPet/:id', petsController.viewAllPet);

module.exports = router;

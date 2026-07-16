const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagos.controller');
const { requireAuth, authorizeRoles } = require('../middleware/auth');

router.post('/webhook',pagosController.webhook);
router.post("/create-checkout-session",requireAuth, authorizeRoles('adoptante'),pagosController.session);

module.exports=router;
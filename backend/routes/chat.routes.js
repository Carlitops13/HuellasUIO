const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { requireAuth, authorizeRoles } = require('../middleware/auth');

router.post('/mini-gpt', requireAuth, chatController.chat);

module.exports = router;
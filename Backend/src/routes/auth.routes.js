const express = require('express');
const { register, login, refresh, logout, logoutAll } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', authMiddleware, logout);
router.post('/logout-all', authMiddleware, logoutAll);

module.exports = router;

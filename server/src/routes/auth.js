const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { auth } = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');

router.post('/register', validationMiddleware.schemas.register, authController.register);
router.post('/login', validationMiddleware.schemas.login, authController.login);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, validationMiddleware.schemas.updateProfile, authController.updateProfile);

module.exports = router;

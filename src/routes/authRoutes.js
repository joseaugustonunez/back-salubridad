// src/routes/authRoutes.js
import express from 'express';
import { register, login ,obtenerUsuarioAutenticado,requestPasswordRecovery, resetPassword, verifyRecoveryToken } from '../controllers/authController.js';
import authenticateToken from '../middlewares/authenticateToken.js';
const router = express.Router();

// Rutas para registrarse e iniciar sesión
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, obtenerUsuarioAutenticado);
router.post('/recover-password', requestPasswordRecovery);
router.post('/reset-password', resetPassword);
router.get('/verify-recovery-token/:token', verifyRecoveryToken);


export default router;
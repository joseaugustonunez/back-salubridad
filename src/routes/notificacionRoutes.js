// src/routes/notificacionRoutes.js
import express from 'express';
import { getNotificaciones, marcarNotificacionLeida, createNotificacion, deleteNotificacion } from '../controllers/notificacionController.js';
import authenticateToken from '../middlewares/authenticateToken.js';

const router = express.Router();

// Rutas para gestionar las notificaciones
router.get('/:usuarioId', authenticateToken, getNotificaciones); // Obtener todas las notificaciones de un usuario
router.patch('/:id/marcarLeida', authenticateToken, marcarNotificacionLeida); // Marcar una notificación como leída
router.post('/', authenticateToken, createNotificacion); // Crear una nueva notificación
router.delete('/:id', authenticateToken, deleteNotificacion); // Eliminar una notificación

export default router;

// src/routes/ubicacionRoutes.js
import express from 'express';
import { getUbicaciones, getUbicacionById, createUbicacion, updateUbicacion, deleteUbicacion } from '../controllers/ubicacionController.js';
import authenticateToken from '../middlewares/authenticateToken.js';

const router = express.Router();


router.get('/', getUbicaciones); // Obtener todas las ubicaciones
router.get('/:id', getUbicacionById); // Obtener una ubicación por su ID
router.post('/', createUbicacion); // Crear una nueva ubicación
router.patch('/:id', updateUbicacion); // Actualizar una ubicación
router.delete('/:id', deleteUbicacion); // Eliminar una ubicación

// Rutas para gestionar las ubicaciones
router.get('/', authenticateToken, getUbicaciones); // Obtener todas las ubicaciones
router.get('/:id', authenticateToken, getUbicacionById); // Obtener una ubicación por su ID
router.post('/', authenticateToken, createUbicacion); // Crear una nueva ubicación
router.patch('/:id', authenticateToken, updateUbicacion); // Actualizar una ubicación
router.delete('/:id', authenticateToken, deleteUbicacion); // Eliminar una ubicación

export default router;

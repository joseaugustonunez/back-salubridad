// src/routes/comentarioRoutes.js
import express from 'express';
import { getComentarios, getComentariosByEstablecimiento, crearComentario, deleteComentario, getComentariosByUsuario } from '../controllers/comentarioController.js';
import authenticateToken from '../middlewares/authenticateToken.js';

const router = express.Router();

// Rutas para gestionar los comentarios
router.get('/', authenticateToken, getComentarios); // Obtener todos los comentarios
router.get('/establecimiento/:establecimientoId', authenticateToken, getComentariosByEstablecimiento); // Obtener comentarios por establecimiento
router.get('/usuario/:userId?', authenticateToken, getComentariosByUsuario); // Obtener comentarios por usuario
router.post('/', authenticateToken, crearComentario); // Crear un nuevo comentario
router.delete('/:id', authenticateToken, deleteComentario); // Eliminar un comentario

export default router;

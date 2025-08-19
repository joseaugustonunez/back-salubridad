// src/routes/promocionRoutes.js
import express from 'express';
import { getPromociones, getPromocionById, createPromocion, updatePromocion, deletePromocion,getPromocionesByEstablecimiento} from '../controllers/promocionController.js';
import authenticateToken from '../middlewares/authenticateToken.js';
import  {upload}  from '../middlewares/upload.js'

const router = express.Router();

// Rutas para gestionar las promociones
router.get('/', authenticateToken, getPromociones); // Obtener todas las promociones
router.get('/:id', authenticateToken, getPromocionById); // Obtener una promoción por ID
router.post('/', authenticateToken, upload.single('imagen'), createPromocion);
router.patch('/:id', authenticateToken, updatePromocion); // Actualizar una promoción
router.delete('/:id', authenticateToken, deletePromocion); // Eliminar una promoción
router.get('/establecimiento/:establecimientoId', getPromocionesByEstablecimiento);

export default router;

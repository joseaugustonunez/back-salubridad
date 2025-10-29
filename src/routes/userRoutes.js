// src/routes/userRoutes.js
import express from 'express';
import { getUsers, getUserById,getEstablecimientosSeguidos,solicitarVendedor,updateUser,getComentariosDeSeguidos,getPromocionesDeSeguidos, deleteUser, uploadProfilePicture, uploadCoverPhoto, updateUserRole } from '../controllers/userController.js';
import authenticateToken from '../middlewares/authenticateToken.js';
import { upload } from '../middlewares/upload.js';
const router = express.Router();

// Rutas para obtener y modificar los datos de los usuarios
router.get('/', authenticateToken, getUsers);
router.get('/:id', authenticateToken, getUserById);
router.patch('/:id', authenticateToken, updateUser);
router.patch('/:id/role', authenticateToken, updateUserRole);
router.get('/:id/seguidos', authenticateToken, getEstablecimientosSeguidos);
router.post('/solicitar-vendedor', authenticateToken, solicitarVendedor);
// Nuevas rutas
router.get('/:id/comentarios', authenticateToken, getComentariosDeSeguidos);
router.get('/:id/promociones', authenticateToken, getPromocionesDeSeguidos);

router.delete('/:id', authenticateToken, deleteUser);
router.post("/:id/profile-picture", upload.single("profilePicture"), uploadProfilePicture);
router.post("/:id/cover-photo", upload.single("coverPhoto"), uploadCoverPhoto);
export default router;
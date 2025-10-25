// src/routes/userRoutes.js
import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser, uploadProfilePicture, uploadCoverPhoto, updateUserRole } from '../controllers/userController.js';
import authenticateToken from '../middlewares/authenticateToken.js';
import { upload } from '../middlewares/upload.js';
const router = express.Router();

// Rutas para obtener y modificar los datos de los usuarios
router.get('/', authenticateToken, getUsers);
router.get('/:id', authenticateToken, getUserById);
router.patch('/:id', authenticateToken, updateUser);
router.patch('/:id/role', authenticateToken, updateUserRole);
router.delete('/:id', authenticateToken, deleteUser);
router.post("/:id/profile-picture", upload.single("profilePicture"), uploadProfilePicture);
router.post("/:id/cover-photo", upload.single("coverPhoto"), uploadCoverPhoto);
export default router;
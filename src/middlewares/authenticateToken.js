// src/middlewares/authenticateToken.js
import jwt from 'jsonwebtoken';
import config from '../config.js';
import User from '../models/userModel.js';

const authenticateToken = async (req, res, next) => {
  try {
    // Obtener el token del encabezado de autorización
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return res.status(401).json({ message: 'No se ha proporcionado un token de acceso' });
    }

    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
      return res.status(401).json({ message: 'Token de acceso mal formado' });
    }

    // Verificar el token
    const decodedToken = jwt.verify(accessToken, config.secretKey);
    
    // Buscar al usuario en la base de datos
    const user = await User.findById(decodedToken.userId).select('-password'); // No incluir la contraseña
    if (!user) {
      return res.status(401).json({ message: 'Token de acceso no válido o el usuario no existe' });
    }

    // Agregar el usuario al objeto de la solicitud para su uso posterior
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    // Manejo específico de errores JWT
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Token de acceso no válido o ha expirado' });
    }
    res.status(500).json({ message: 'Ha ocurrido un error al autenticar el token de acceso' });
  }
};

export default authenticateToken;

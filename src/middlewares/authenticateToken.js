import jwt from 'jsonwebtoken';
import config from '../config.js';
import User from '../models/userModel.js';

const authenticateToken = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return res.status(401).json({ message: 'No se ha proporcionado un token de acceso' });
    }

    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
      return res.status(401).json({ message: 'Token de acceso mal formado' });
    }

    const decodedToken = jwt.verify(accessToken, config.secretKey);
    
    const user = await User.findById(decodedToken.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Token de acceso no válido o el usuario no existe' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Token de acceso no válido o ha expirado' });
    }
    res.status(500).json({ message: 'Ha ocurrido un error al autenticar el token de acceso' });
  }
};

export default authenticateToken;

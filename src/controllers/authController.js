import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import User from '../models/userModel.js';
import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
  service: 'gmail', // O configura con SMTP directo
  auth: {
    user: process.env.EMAIL_USER || 'joseaugustonunezvicente@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'vdwz zhuz eyhn pipk'
  }
});
//https://accounts.google.com/v3/signin/challenge/pwd?TL=ADBLaQCheWmgZqc92vbErNUOKKQhubSZdv03Z75CvsJwqknLzOVW1wcZ3ikQ7iFq&cid=2&continue=https%3A%2F%2Fmyaccount.google.com%2Fapppasswords&flowName=GlifWebSignIn&followup=https%3A%2F%2Fmyaccount.google.com%2Fapppasswords&ifkv=AXH0vVuQi4VicI21s7cUL7N7dpokooKgzGNbzFiTj9mgu6q9EtrdDAAae8vHm0Kt61bQHdea2AemMQ&osid=1&rart=ANgoxce5FjPdP9Am7L8qfS0FX96YvNA_JAKpPh-N2ivSWpzEUfLcsyKqZuiTcWNTwlV3p_xWzy6927KUQNO3EJfE8rsx7B_bxk52gBXF0wOwV19gy1jpFCk&rpbg=1&service=accountsettings
// Función para solicitar recuperación de contraseña
export const requestPasswordRecovery = async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar si el correo electrónico existe
    const user = await User.findOne({ email });
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return res.status(200).json({ 
        message: 'Si el correo existe, recibirás un email con instrucciones para recuperar tu contraseña' 
      });
    }

    // Generar un token de recuperación (expira en 1 hora)
    const recoveryToken = jwt.sign(
      { userId: user._id, purpose: 'password-recovery' },
      config.secretKey,
      { expiresIn: '1h' }
    );

    // Guardar el token en el usuario
    user.recoveryToken = recoveryToken;
    user.recoveryTokenExpires = new Date(Date.now() + 3600000); // 1 hora
    await user.save();

    // URL para restablecer contraseña (ajusta según tu frontend)
    const resetUrl = `https://establecimientosmda.sistemasudh.com/cambiar?token=${recoveryToken}`;

    // Enviar email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: user.email,
      subject: 'Recuperación de contraseña',
      html: `
        <h1>Recuperación de contraseña</h1>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #84cc16; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a>
        <p>Este enlace es válido por 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    // Responder al cliente
    res.status(200).json({ 
      message: 'Si el correo existe, recibirás un email con instrucciones para recuperar tu contraseña' 
    });

  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    res.status(500).json({ message: 'Ha ocurrido un error al procesar tu solicitud' });
  }
};

// Función para restablecer la contraseña con el token
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token y nueva contraseña son requeridos' });
    }

    // Verificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, config.secretKey);
      if (decoded.purpose !== 'password-recovery') {
        return res.status(400).json({ message: 'Token inválido' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    // Buscar el usuario
    const user = await User.findOne({ 
      _id: decoded.userId,
      recoveryToken: token,
      recoveryTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    // Actualizar la contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.recoveryToken = undefined;
    user.recoveryTokenExpires = undefined;
    await user.save();

    // Responder al cliente
    res.status(200).json({ message: 'Contraseña actualizada correctamente' });

  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ message: 'Ha ocurrido un error al restablecer la contraseña' });
  }
};

// Función para verificar si un token de recuperación es válido
export const verifyRecoveryToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ message: 'Token requerido' });
    }

    // Verificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, config.secretKey);
      if (decoded.purpose !== 'password-recovery') {
        return res.status(400).json({ isValid: false });
      }
    } catch (error) {
      return res.status(400).json({ isValid: false });
    }

    // Buscar el usuario con ese token
    const user = await User.findOne({ 
      _id: decoded.userId,
      recoveryToken: token,
      recoveryTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ isValid: false });
    }

    // El token es válido
    res.status(200).json({ isValid: true });

  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
export const obtenerUsuarioAutenticado = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    res.status(200).json(req.user); // Devuelve los datos del usuario autenticado
  } catch (error) {
    console.error('Error al obtener el usuario autenticado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
export const register = async (req, res) => {
  try {
    const { email, password, nombreUsuario } = req.body;

    // Verificar si ya existe un usuario con el mismo correo electrónico
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Ya existe un usuario con el mismo correo electrónico" });
    }

    // Verificar si ya existe un usuario con el mismo nombre de usuario
    const existingUsername = await User.findOne({ nombreUsuario });
    if (existingUsername) {
      return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
    }

    // Crear un nuevo usuario con nombreUsuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, nombreUsuario });
    await newUser.save();

    // Generar un token de acceso
    const accessToken = jwt.sign({ userId: newUser._id }, config.secretKey, { expiresIn: "1h" });

    // Enviar respuesta al cliente
    res.status(201).json({ accessToken, message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ha ocurrido un error al registrar el usuario" });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si el correo electrónico existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar si la contraseña es válida
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar un token de acceso
    const accessToken = jwt.sign({ userId: user._id }, config.secretKey);

    // Excluir la contraseña antes de devolver los datos del usuario
    const { password: userPassword, ...userData } = user.toObject();

    // Enviar la respuesta con el token y los datos del usuario
    res.status(200).json({
      accessToken,
      user: userData, // Incluye los datos del usuario en la respuesta
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al iniciar sesión' });
  }
};

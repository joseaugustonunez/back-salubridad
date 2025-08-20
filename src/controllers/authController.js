//https://accounts.google.com/v3/signin/challenge/pwd?TL=ADBLaQCheWmgZqc92vbErNUOKKQhubSZdv03Z75CvsJwqknLzOVW1wcZ3ikQ7iFq&cid=2&continue=https%3A%2F%2Fmyaccount.google.com%2Fapppasswords&flowName=GlifWebSignIn&followup=https%3A%2F%2Fmyaccount.google.com%2Fapppasswords&ifkv=AXH0vVuQi4VicI21s7cUL7N7dpokooKgzGNbzFiTj9mgu6q9EtrdDAAae8vHm0Kt61bQHdea2AemMQ&osid=1&rart=ANgoxce5FjPdP9Am7L8qfS0FX96YvNA_JAKpPh-N2ivSWpzEUfLcsyKqZuiTcWNTwlV3p_xWzy6927KUQNO3EJfE8rsx7B_bxk52gBXF0wOwV19gy1jpFCk&rpbg=1&service=accountsettings
// Función para solicitar recuperación de contraseña
// Función para solicitar recuperación de contraseña
// Función para solicitar recuperación de contraseña
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import User from '../models/userModel.js';
import nodemailer from 'nodemailer';

const getSecretKey = () => {
  // Ahora usa directamente config.secretKey que ya tiene fallback
  const secret = config?.secretKey;
  if (!secret || typeof secret !== 'string' || !secret.trim()) {
    return null;
  }
  return secret;
};

const ensureMailerReady = () => {
  // Usa config que ya tiene fallback a hardcoded
  const user = config.emailUser;
  const pass = config.emailPassword;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

// Creamos el transporter sólo si hay credenciales
const transporter = ensureMailerReady();

// ==============================
// Solicitar recuperación de contraseña
// ==============================
export const requestPasswordRecovery = async (req, res) => {
  try {
    const SECRET = getSecretKey();
    if (!SECRET) {
      console.error('JWT secretKey no configurado. Define JWT_SECRET y expórtalo en config.secretKey.');
      return res.status(500).json({ message: 'Error de configuración del servidor' });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'El email es requerido' });
    }

    // Por seguridad, siempre responde 200 aunque no exista
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        message: 'Si el correo existe, recibirás un email con instrucciones para recuperar tu contraseña',
      });
    }

    // Generar token de recuperación (1h)
    const recoveryToken = jwt.sign(
      { userId: user._id, purpose: 'password-recovery' },
      SECRET,
      { expiresIn: '1h' }
    );

    // Guardar token y expiración
    user.recoveryToken = recoveryToken;
    user.recoveryTokenExpires = new Date(Date.now() + 3600000); // 1 hora
    await user.save();

    // URL del frontend
    const resetUrl = `https://establecimientosmda.sistemasudh.com/cambiar?token=${recoveryToken}`;

    // Enviar email sólo si el transporter está listo
    if (!transporter) {
      console.error('EMAIL_USER/EMAIL_PASSWORD no configurados. No se pudo enviar el correo de recuperación.');
    } else {
      const mailOptions = {
        from: config.emailUser,
        to: user.email,
        subject: 'Recuperación de contraseña',
        html: `
          <h1>Recuperación de contraseña</h1>
          <p>Has solicitado restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <a href="${resetUrl}" style="display:inline-block;background-color:#84cc16;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">Restablecer contraseña</a>
          <p>Este enlace es válido por 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (e) {
        console.error('No se pudo enviar el correo de recuperación:', e);
        // No revelamos el fallo al cliente, mantenemos la respuesta genérica
      }
    }

    return res.status(200).json({
      message: 'Si el correo existe, recibirás un email con instrucciones para recuperar tu contraseña',
    });
  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    return res.status(500).json({ message: 'Ha ocurrido un error al procesar tu solicitud' });
  }
};

// ==============================
// Restablecer contraseña con token
// ==============================
export const resetPassword = async (req, res) => {
  try {
    const SECRET = getSecretKey();
    if (!SECRET) {
      console.error('JWT secretKey no configurado. Define JWT_SECRET y expórtalo en config.secretKey.');
      return res.status(500).json({ message: 'Error de configuración del servidor' });
    }

    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token y nueva contraseña son requeridos' });
    }

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, SECRET);
      if (decoded.purpose !== 'password-recovery') {
        return res.status(400).json({ message: 'Token inválido' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    // Buscar usuario con el token vigente
    const user = await User.findOne({
      _id: decoded.userId,
      recoveryToken: token,
      recoveryTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    // Actualizar contraseña y limpiar token
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.recoveryToken = undefined;
    user.recoveryTokenExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    return res.status(500).json({ message: 'Ha ocurrido un error al restablecer la contraseña' });
  }
};

// ==============================
// Verificar validez de token de recuperación
// ==============================
export const verifyRecoveryToken = async (req, res) => {
  try {
    const SECRET = getSecretKey();
    if (!SECRET) {
      console.error('JWT secretKey no configurado. Define JWT_SECRET y expórtalo en config.secretKey.');
      return res.status(500).json({ isValid: false });
    }

    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: 'Token requerido' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, SECRET);
      if (decoded.purpose !== 'password-recovery') {
        return res.status(400).json({ isValid: false });
      }
    } catch (error) {
      return res.status(400).json({ isValid: false });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      recoveryToken: token,
      recoveryTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ isValid: false });
    }

    return res.status(200).json({ isValid: true });
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ==============================
// Obtener usuario autenticado
// ==============================
export const obtenerUsuarioAutenticado = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    return res.status(200).json(req.user);
  } catch (error) {
    console.error('Error al obtener el usuario autenticado:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ==============================
// Registro
// ==============================
export const register = async (req, res) => {
  try {
    const SECRET = getSecretKey();
    if (!SECRET) {
      console.error('JWT secretKey no configurado. Define JWT_SECRET y expórtalo en config.secretKey.');
      return res.status(500).json({ message: 'Error de configuración del servidor' });
    }

    const { email, password, nombreUsuario } = req.body;

    if (!email || !password || !nombreUsuario) {
      return res.status(400).json({ message: 'email, password y nombreUsuario son requeridos' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Ya existe un usuario con el mismo correo electrónico' });
    }

    const existingUsername = await User.findOne({ nombreUsuario });
    if (existingUsername) {
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, nombreUsuario });
    await newUser.save();

    const accessToken = jwt.sign({ userId: newUser._id }, SECRET, { expiresIn: '1h' });

    return res.status(201).json({ accessToken, message: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({ message: 'Ha ocurrido un error al registrar el usuario' });
  }
};

// ==============================
// Login
// ==============================
export const login = async (req, res) => {
  try {
    const SECRET = getSecretKey();
    if (!SECRET) {
      console.error("JWT secretKey no configurado. Define JWT_SECRET en config.js.");
      return res.status(500).json({ message: "Error de configuración del servidor" });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email y password son requeridos" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // ✅ Tokens con expiración diferente
    const accessToken = jwt.sign({ userId: user._id }, SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: user._id }, SECRET, { expiresIn: "7d" });

    // Guardamos el refreshToken en BD para poder invalidarlo
    user.refreshToken = refreshToken;
    await user.save();

    const { password: _pwd, ...userData } = user.toObject();

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: userData,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Ha ocurrido un error al iniciar sesión" });
  }
};
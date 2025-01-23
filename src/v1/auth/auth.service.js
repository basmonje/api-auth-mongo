import UserModel, {
  comparePassword,
  encryptPassword,
} from "../users/user.model.js";
import TokenModel from "./token.model.js";
import TwoFactor from "./two-factor.model.js";
import SessionService from "../sessions/session.service.js";
import PasswordResetModel from "./password-reset.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ErrorHandler } from "../../utils/error.js";
import { JWT_SECRET_APP, JWT_REFRESH_SECRET_APP } from "../../utils/config.js";

// Generar código y fecha de vencimiento
function generateTwoFactorCode() {
  const code = crypto.randomInt(100000, 999999); // Código de 6 dígitos
  const expires = new Date(Date.now() + 5 * 60 * 1000); // Expira en 5 minutos
  return { code, expires };
}

const session = new SessionService();

export default class AuthService {
  async generateTokens(userId) {
    // Crear access token
    const accessToken = jwt.sign({ user_id: userId }, JWT_SECRET_APP, {
      expiresIn: "1h",
    });

    // Crear refresh token
    const refreshToken = jwt.sign({ user_id: userId }, JWT_REFRESH_SECRET_APP, {
      expiresIn: "7d",
    });

    // Guardar refresh token en la base de datos
    const tokenDoc = new TokenModel({
      user_id: userId,
      token: refreshToken,
      type: "refresh",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
    });

    await tokenDoc.save();

    return { accessToken, refreshToken };
  }

  async login({ email, username, password }, requestInfo) {
    const userFound = await UserModel.findOne({
      email: email,
    }).populate("roles");

    if (!userFound) ErrorHandler.notFound("No existe Usuario");

    const matchPassword = await comparePassword(password, userFound.password);

    if (!matchPassword) ErrorHandler.unauthorized("Contraseña incorrecta.");

    userFound.last_login = new Date();

    await userFound.save();

    if (userFound.two_factor_enabled) {
      const { code, expires } = generateTwoFactorCode();

      const newTwoFactorInUser = new TwoFactor({
        code: code,
        expires_at: expires,
        user_id: userFound._id,
      });

      await newTwoFactorInUser.save();

      console.log(`Código 2FA para ${userFound.email}: ${code}`);

      return {
        message: "Código enviado con exito, revisar entraba de mensajes.",
        // code: code,
        // email: userFound.email,
      };
    }

    const tokens = await this.generateTokens(userFound._id);

    await session.create({
      user_id: userFound._id,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user_agent: "",
      ip_address: "",
      device_info: {
        type: "other",
        browser: "",
        os: "",
      },
    });

    return {
      id: userFound._id,
      tokens,
    };
  }

  async register({ username, name, password, email }) {
    const roles = [];
    const newUser = new UserModel({
      username: username,
      name: name,
      password: await encryptPassword(password),
      email: email,
      roles: roles,
    });

    const currentUser = await newUser.save();
    return {
      username: currentUser.username,
      name: currentUser.name,
      email: currentUser.email,
      _id: currentUser._id,
    };
  }

  async logout(token) {
    // const token = null;
    // Invalidar sesion con token
    // Buscar sesion y cerrar?
    // Invalidar el token actual
    // const blacklistedToken = new TokenModel({
    //   user_id: user_id,
    //   token: token,
    //   type: "blacklist",
    //   expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
    // });
    // await blacklistedToken.save();
    // Eliminar refresh tokens
    // await TokenModel.deleteMany({
    //   user_id: user_id,
    //   type: "refresh",
    // });
    await session.revoke({
      access_token: token,
    });
  }

  async forgotPassword({ email }) {
    const user = await UserModel.findOne({ email });
    if (!user) ErrorHandler.notFound("Usuario no encontrado");

    // Generar token aleatorio
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Crear nuevo registro de reset
    const passwordReset = new PasswordResetModel({
      user_id: user._id,
      token: resetTokenHash,
      expires_at: new Date(Date.now() + 3600000), // 1 hora
    });

    await passwordReset.save();

    // Aquí normalmente enviarías el email con el resetToken
    console.log(`Token de restablecimiento: ${resetToken}`);

    return {
      message:
        "Si el correo existe, recibirás instrucciones para restablecer tu contraseña",
    };
  }

  async restartPassword(token, { password }) {
    // Hash del token recibido
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Buscar token válido
    const passwordReset = await PasswordResetModel.findOne({
      token: resetTokenHash,
      used: false,
      expires_at: { $gt: new Date() },
    });

    if (!passwordReset) {
      ErrorHandler.unauthorized("Token inválido o expirado");
    }

    // Buscar y actualizar usuario
    const user = await UserModel.findById(passwordReset.user_id);
    if (!user) {
      ErrorHandler.notFound("Usuario no encontrado");
    }

    // Actualizar contraseña
    user.password = await encryptPassword(password);
    await user.save();

    // Marcar token como usado
    passwordReset.used = true;

    await passwordReset.save();

    return {
      message: "Contraseña actualizada exitosamente",
    };
  }

  async verifyAuth({ email, code }) {
    if (!email || !code) ErrorHandler.notFound("No existen credenciales");

    const userFound = await UserModel.findOne({
      email: email,
    });

    if (!userFound) ErrorHandler.notFound("No existe Usuario");

    const factorFound = await TwoFactor.findOne({
      user_id: userFound._id,
      code,
    });

    if (!factorFound || factorFound.expires_at < Date.now()) {
      ErrorHandler.unauthorized("Código inválido o expirado");
    }

    const tokens = await this.generateTokens(userFound._id);

    await TwoFactor.deleteOne({ _id: factorFound._id });

    return {
      id: userFound._id,
      tokens,
    };
  }

  async refreshToken(refreshToken) {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET_APP);

    // Verificar si el refresh token es válido
    const [tokenDoc, sess] = await Promise.all([
      TokenModel.findOne({
        user_id: decoded.user_id,
        token: refreshToken,
        type: "refresh",
      }),
      session.find({
        user_id: decoded.user_id,
        refresh_token: refreshToken,
        status: "active",
      }),
    ]);

    if (!tokenDoc || !sess) {
      ErrorHandler.unauthorized("Refresh token inválido");
    }

    // Generar nuevo access token
    const accessToken = jwt.sign({ user_id: decoded.user_id }, JWT_SECRET_APP, {
      expiresIn: "1h",
    });

    await session.updateSession({
      session_id: sess._id,
      accessToken: accessToken,
    });

    return { accessToken };
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await UserModel.findById(userId);

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      ErrorHandler.unauthorized("Contraseña actual incorrecta");
    }

    user.password = await encryptPassword(newPassword);
    await user.save();

    // Invalidar todas las sesiones existentes
    // Preguntar si quiere cerrar todas las sesiones
    // await this.logout(userId, token);
  }
}

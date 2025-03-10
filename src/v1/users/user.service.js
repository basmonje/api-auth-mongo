import UserModel, { encryptPassword, comparePassword } from "./user.model.js";
import RoleModel from "../roles/role.model.js";
import SessionModel from "../sessions/session.model.js";
import { ErrorHandler } from "../../utils/error.js";

export default class UserService {
  async create(data) {
    const newUser = new UserModel({
      username: data.username,
      email: data.email,
      name: data.name,
      password: await encryptPassword(data.password),
      roles: data.roles || null,
      last_login: null,
    });

    const currentUser = await newUser.save();
    return {
      id: currentUser._id,
      name: currentUser.name,
      username: currentUser.username,
      email: currentUser.email,
    };
  }

  async getAll() {
    return await UserModel.find()
      .select([
        "username",
        "name",
        "email",
        "last_login",
        "roles",
      ])
      .populate("roles");
  }

  async getById(user_id) {
    if (!user_id) ErrorHandler.notFound("No existe ID");

    const user = await UserModel.findById(user_id);

    if (!user) ErrorHandler.notFound("Usuario no encontrado");

    return user;
  }

  async exists(user_id) {
    if (!user_id) ErrorHandler.notFound("No existe ID");

    const user = await UserModel.findById(user_id);

    if (!user) return false;

    return true;
  }

  async remove(user_id) {
    if (!user_id) ErrorHandler.notFound("No existe ID");

    const exists = await this.exists(user_id);

    if (!exists) ErrorHandler.notFound("No existe usuario");

    const response = await UserModel.findByIdAndDelete(user_id);

    if (!response) ErrorHandler.notFound("No se eliminó Usuario");

    return user_id;
  }

  async update(user_id, data) {
    if (!user_id) ErrorHandler.notFound("No existe ID");

    const exists = await this.exists(user_id);

    if (!exists) ErrorHandler.notFound("No existe usuario");

    const currentUser = await UserModel.findByIdAndUpdate(user_id, data, {
      new: true,
    });

    if (!currentUser) ErrorHandler.notFound("No se modificó Usuario");

    return user_id;
  }

  async findByEmailOrUsername({ email, username }) {
    return await UserModel.findOne({
      $or: [{ email: email }, { username: username }],
    });
  }

  async getProfile(user_id) {
    if (!user_id) ErrorHandler.notFound("No existe ID");

    const user = await UserModel.findById(user_id)
      .select(["username", "name", "email", "active", "last_login", "roles"])
      .populate("roles");

    if (!user) ErrorHandler.notFound("Usuario no encontrado");

    return user;
  }

  async getRoles(user_id) {
    if (!user_id) ErrorHandler.notFound("No existe ID");

    const user = await UserModel.findById(user_id).populate("roles");

    if (!user) ErrorHandler.notFound("Usuario no encontrado");

    return {
      id: user._id,
      roles: user.roles,
    };
  }

  async assignRole(user_id, { role_ids }) {
    if (!user_id) ErrorHandler.notFound("No existe ID");

    const user = await UserModel.findById(user_id);
    if (!user) ErrorHandler.notFound("Usuario no encontrado");

    // Verificar que los roles existan
    const roles = await RoleModel.find({
      _id: { $in: role_ids },
    });

    if (roles.length !== role_ids.length) {
      ErrorHandler.notFound("Uno o más roles no existen");
    }

    // Agregar solo roles que no tenga ya asignados
    const newRoles = roles.filter((role) => !user.roles.includes(role._id));

    user.roles.push(...newRoles.map((role) => role._id));
    await user.save();

    return {
      user_id: user._id,
      roles: await user.populate("roles"),
    };
  }

  async revokeRole(user_id, { role_ids }) {
    if (!user_id) ErrorHandler.notFound("No existe ID");

    const user = await UserModel.findById(user_id);
    if (!user) ErrorHandler.notFound("Usuario no encontrado");

    // Verificar que los roles existan
    await RoleModel.find({
      _id: { $in: role_ids },
    });

    // Remover los roles especificados
    user.roles = user.roles.filter(
      (roleId) => !role_ids.includes(roleId.toString())
    );

    await user.save();

    return {
      user_id: user._id,
      roles: await user.populate("roles"),
    };
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await this.getById(userId);

    // Verificar contraseña actual
    const isValidPassword = await comparePassword(
      currentPassword,
      user.password
    );

    if (!isValidPassword) {
      ErrorHandler.unauthorized("Contraseña actual incorrecta");
    }

    // Actualizar contraseña
    user.password = await encryptPassword(newPassword);
    await user.save();

    // Revocar todas las sesiones
    await SessionModel.revokeUserSessions(userId, "password_changed");

    return { message: "Contraseña actualizada exitosamente" };
  }

  async updateUserStatus(userId, active) {
    const user = await this.getById(userId);

    user.active = active;
    await user.save();

    if (!active) {
      // Si se desactiva, revocar todas las sesiones
      await SessionModel.revokeUserSessions(userId, "account_disabled");
    }

    return {
      message: active ? "Usuario activado" : "Usuario desactivado",
      active: user.active,
    };
  }
}

import UserModel, { encryptPassword } from "./user.model.js";
import RoleModel from "../roles/role.model.js";
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
        "two_factor_enabled",
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

  async toggleTwoFactor(user_id, enable) {
    const userFound = await this.getById(user_id);

    if (!userFound) {
      ErrorHandler.notFound("Usuario no encontrado");
    }

    function stringToBoolean(value) {
      if (typeof value === "string") {
        return value.toLowerCase() === "true";
      } else if (typeof value === "boolean") {
        return value;
      }
      return false; // O lanza un error si no es string
    }

    userFound.two_factor_enabled = stringToBoolean(enable);

    await userFound.save();

    const status = enable ? "activado" : "desactivado";

    return { message: `2FA ${status} correctamente` };
  }
}

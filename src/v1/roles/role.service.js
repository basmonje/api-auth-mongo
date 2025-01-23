import RoleModel from "./role.model.js";
import { ErrorHandler } from "../../utils/error.js";

export default class RoleService {
  async create(data) {
    const newRole = new RoleModel({
      name: data.name,
      description: data.description,
      permissions: data.permissions,
    });

    await newRole.save();

    return {
      id: newRole._id,
      name: newRole.name,
      description: newRole.description,
    };
  }

  async getAll() {
    return await RoleModel.find().select(["name", "description"]);
  }

  async update(role_id, data) {
    if (!role_id) ErrorHandler.notFound("No existe ID");

    // Verificar si existe
    await this.getById(role_id);

    // Eliminar rol
    const currentRole = await RoleModel.findByIdAndUpdate(role_id, data, {
      new: true,
    });

    if (!currentRole) ErrorHandler.notFound("No se modificó Usuario");

    return role_id;
  }

  async remove(role_id) {
    if (!role_id) ErrorHandler.notFound("No existe ID");

    // Verificar si existe rol
    await this.getById(role_id);

    // Logica para eliminar rol
    const currentRole = await RoleModel.findByIdAndDelete(role_id);

    if (!currentRole) ErrorHandler.notFound("No se eliminó Rol");

    return role_id;
  }

  async getById(role_id) {
    if (!role_id) ErrorHandler.notFound("No existe ID");

    const role = await RoleModel.findById(role_id);

    if (!role) ErrorHandler.notFound("Rol no encontrado");

    return role;
  }

  async getByName(role_name) {
    const role = await RoleModel.findOne({
      name: role_name,
    }).populate("permissions");
    return role;
  }
}

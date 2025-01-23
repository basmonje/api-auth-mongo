import PermissionModel from "./permission.model.js";
import { ErrorHandler } from "../../utils/error.js";

export default class PermissionService {
  async create(data) {
    const newPermission = new PermissionModel({
      name: data.name,
      description: data.description,
      action: data.action,
      attributes: data.attributes,
      resource: data.resource,
    });

    await newPermission.save();

    return {
      id: newPermission._id,
      name: newPermission.name,
      description: newPermission.description,
    };
  }

  async getAll() {
    return await PermissionModel.find().select(["name", "description", "_id"]);
  }

  async update(permission_id, data) {
    if (!permission_id) ErrorHandler.notFound("No existe ID");

    // Verificar si existe
    await this.getById(permission_id);

    // Eliminar rol
    const currPermission = await PermissionModel.findByIdAndUpdate(
      permission_id,
      data,
      {
        new: true,
      }
    );

    if (!currPermission) ErrorHandler.notFound("No se modificó Permiso");

    return permission_id;
  }

  async remove(permission_id) {
    if (!permission_id) ErrorHandler.notFound("No existe ID");

    // Verificar si existe rol
    await this.getById(permission_id);

    // Logica para eliminar rol
    const currPermission = await PermissionModel.findByIdAndDelete(
      permission_id
    );

    if (!currPermission) ErrorHandler.notFound("No se eliminó Permiso");

    return permission_id;
  }

  async getById(permission_id) {
    if (!permission_id) ErrorHandler.notFound("No existe ID");

    const currPermission = await PermissionModel.findById(permission_id);

    if (!currPermission) ErrorHandler.notFound("Permiso no encontrado");

    return currPermission;
  }
}

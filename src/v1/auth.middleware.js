import SessionModel from "./sessions/session.model.js";
import RoleService from "./roles/role.service.js";
import { ErrorHandler } from "../utils/error.js";

export const checkAuthorization = async (req, res, next) => {
  const token = req.headers.authorization;

  const session = await SessionModel.findOne({
    access_token: token,
    status: "active",
    expires_at: { $gt: new Date() },
  });

  if (!session) {
    ErrorHandler.unauthorized("Sesión inválida o expirada");
  }

  await session.updateLastActivity();

  req.session = session;
  req.user = { id: session.user_id };

  next();
};

const roleService = new RoleService();

export function checkPermission(resource, action) {
  return async (req, res, next) => {
    try {
      // Asegúrate de que el usuario esté autenticado (req.user debe ser establecido por un middleware anterior)
      if (!req.user || !req.user.id) {
        return ErrorHandler.unauthorized("Se requiere autenticación");
      }

      // Obtén los roles del usuario
      const userRoles = req.session.user.roles;

      // Si no tiene roles asignados, deniega el acceso
      if (!userRoles || userRoles.length === 0) {
        return ErrorHandler.forbidden("No hay roles asignados");
      }

      // Verifica cada rol para ver si tiene el permiso requerido
      const hasPermission = await checkRolesForPermission(
        userRoles,
        resource,
        action
      );

      if (!hasPermission) {
        return ErrorHandler.forbidden(
          `Permisos insuficientes para ${action} en ${resource}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

async function checkRolesForPermission(roles, resource, action) {
  for (const roleId of roles) {
    const role = await roleService.getById(roleId);

    // Verifica si el rol tiene permisos
    if (role.permissions && role.permissions.length > 0) {
      const matchingPermission = await findMatchingPermission(
        role.permissions,
        resource,
        action
      );

      if (matchingPermission) {
        return true;
      }
    }
  }
  return false;
}

async function findMatchingPermission(permissionIds, resource, action) {
  const PermissionModel = require("./permissions/permission.model.js").default;

  return await PermissionModel.findOne({
    _id: { $in: permissionIds },
    resource: resource,
    $or: [
      { action: action },
      { action: "manage" }, // La acción 'manage' implica todos los permisos
    ],
  });
}

// Ejemplo de uso en rutas:
// router.post("/", checkPermission('users', 'create'), controllers.create);
// router.get("/", checkPermission('users', 'read'), controllers.getAll);
// router.put("/:id", checkPermission('users', 'update'), controllers.update);
// router.delete("/:id", checkPermission('users', 'delete'), controllers.remove);

import { Router } from "express";
import PermissionRouter from "./permissions/permission.route.js";
import RoleRouter from "./roles/role.route.js";
import UserRouter from "./users/user.route.js";
import AuthRouter from "./auth/auth.route.js"
import SessionRouter from './sessions/session.route.js';

export default function routerV1(app) {
  const router = Router();
  app.use("/api/v1", router);

  router.use("/permissions", PermissionRouter);
  router.use("/roles", RoleRouter);
  router.use("/users", UserRouter);
  router.use("/auth", AuthRouter);
  router.use("/session", SessionRouter);
}

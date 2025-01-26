import { Router } from "express";
import controllers from "./session.controller.js";

const router = Router();

// Listar sesiones activas de un usuario
router.get("/:userId/active", controllers.listSessions);

// Revocar una sesión específica
router.delete("/:sessionId", controllers.revokeSession);

// Revocar todas las sesiones de un usuario
router.delete("/:userId/all", controllers.revokeAllSessions);

// Ver todas las sesiones
router.get("/", controllers.getAll);

export default router;

import { Router } from "express";
// import { validateSchema } from "../../utils/validate.js";
// import { updateUserSchema } from "./user.schema.js";

import controllers from "./user.controller.js";

const router = Router();

router.post("/", controllers.create);

router.get("/", controllers.getAll);

router.get("/:id", controllers.getById);

router.put("/:id", controllers.update);

router.delete("/:id", controllers.remove);

router.get("/:id/profile", controllers.getProfile);

router.get("/:id/roles", controllers.getRoles);

router.post("/:id/roles", controllers.assignRole);

router.delete("/:id/roles", controllers.revokeRole);

router.post("/:id/togle-2fa", controllers.toggleTwoFactor);

export default router;

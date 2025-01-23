import { Router } from "express";
// import { validateSchema } from "../../utils/validate.js";
// import { updateUserSchema } from "./role.schema.js";

import controllers from "./role.controller.js";

const router = Router();

router.post("/", controllers.create);

router.get("/", controllers.getAll);

router.put("/:id", controllers.update);

router.delete("/:id", controllers.remove);

export default router;

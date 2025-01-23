import { Router } from "express";
// import { validateSchema } from "../../utils/validate.js";
// import { updateUserSchema } from "./permission.schema.js";

import controllers from "./permission.controller.js";

const router = Router();

router.post("/", controllers.create);

router.get("/", controllers.getAll);

router.put("/:id", controllers.update);

router.delete("/:id", controllers.remove);

export default router;

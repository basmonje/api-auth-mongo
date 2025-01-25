import { Router } from "express";
// import { validateSchema } from "../../utils/validate.js";
// import { updateUserSchema } from "./auth.schema.js";

import controllers from "./auth.controller.js";

const router = Router();

router.post("/signin", controllers.signIn);

router.post("/signup", controllers.signUp);

router.post("/verify", controllers.verifyAuth);

router.post("/forgot-password", controllers.forgotPassword);

router.post("/:token/reset-password", controllers.resetPassword);

// router.post("/:token/logout", validateToken, controllers.logout);

// router.put('/change-password', validateToken, controllers.changePassword);

router.post("/refresh-token", controllers.refreshToken);

export default router;

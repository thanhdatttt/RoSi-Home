import { Router } from "express";
import {
  register,
  loginHandler,
  refreshHandler,
  logoutHandler,
  changePasswordHandler,
  forgotPasswordHandler,
} from "./controller.js";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  changePasswordSchema,
  forgotPasswordSchema,
} from "./schema.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), asyncHandler(register));
authRouter.post("/login", validate(loginSchema), asyncHandler(loginHandler));
authRouter.post("/refresh", validate(refreshSchema), asyncHandler(refreshHandler));
authRouter.post("/logout", requireAuth, validate(logoutSchema), asyncHandler(logoutHandler));
authRouter.post("/change-password", requireAuth, validate(changePasswordSchema), asyncHandler(changePasswordHandler));
authRouter.post("/forgot-password", validate(forgotPasswordSchema), asyncHandler(forgotPasswordHandler));

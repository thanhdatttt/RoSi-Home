import { Router } from "express";
import {
  register,
  loginHandler,
  logout,
  changePasswordHandler,
} from "./controller.js";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { registerSchema, loginSchema, changePasswordSchema } from "./schema.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  validate(registerSchema),
  asyncHandler(register),
);
authRouter.post("/login", validate(loginSchema), asyncHandler(loginHandler));
authRouter.post("/logout", requireAuth, asyncHandler(logout));
authRouter.post(
  "/change-password",
  requireAuth,
  validate(changePasswordSchema),
  asyncHandler(changePasswordHandler),
);

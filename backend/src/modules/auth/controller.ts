import type { Request, Response } from "express";
import { registerLandlord, login, changePassword } from "./service.js";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { registerSchema, loginSchema, changePasswordSchema } from "./schema.js";

async function register(req: Request, res: Response): Promise<void> {
  const result = await registerLandlord(req.body);
  res.status(201).json({ data: result });
}

async function loginHandler(req: Request, res: Response): Promise<void> {
  const result = await login(req.body);
  res.status(200).json({ data: result });
}

async function logout(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ data: { success: true } });
}

async function changePasswordHandler(req: Request, res: Response): Promise<void> {
  const result = await changePassword(req.user!.id, req.body);
  res.status(200).json({ data: result });
}

export { register, loginHandler, logout, changePasswordHandler };

import type { Request, Response } from "express";
import { registerLandlord, login, refreshTokens, logout, changePassword, forgotPassword } from "./service.js";

async function register(req: Request, res: Response): Promise<void> {
  const result = await registerLandlord(req.body);
  res.status(201).json({ data: result });
}

async function loginHandler(req: Request, res: Response): Promise<void> {
  const result = await login(req.body);
  res.status(200).json({ data: result });
}

async function refreshHandler(req: Request, res: Response): Promise<void> {
  const result = await refreshTokens(req.body);
  res.status(200).json({ data: result });
}

async function logoutHandler(req: Request, res: Response): Promise<void> {
  const result = await logout(req.user!.id, req.body.refreshToken);
  res.status(200).json({ data: result });
}

async function changePasswordHandler(req: Request, res: Response): Promise<void> {
  const result = await changePassword(req.user!.id, req.body);
  res.status(200).json({ data: result });
}

async function forgotPasswordHandler(req: Request, res: Response): Promise<void> {
  const result = await forgotPassword(req.body);
  res.status(200).json({ data: result });
}

export {
  register,
  loginHandler,
  refreshHandler,
  logoutHandler,
  changePasswordHandler,
  forgotPasswordHandler,
};

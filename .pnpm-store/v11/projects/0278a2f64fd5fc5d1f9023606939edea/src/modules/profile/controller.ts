import type { Request, Response } from "express";
import { getOwnProfile, updateOwnProfile } from "./repository.js";

async function getProfile(req: Request, res: Response): Promise<void> {
  const profile = await getOwnProfile(req.user!.id);
  res.status(200).json({ data: profile });
}

async function updateProfile(req: Request, res: Response): Promise<void> {
  const profile = await updateOwnProfile(req.user!.id, req.body);
  res.status(200).json({ data: profile });
}

export { getProfile, updateProfile };

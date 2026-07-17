import type { Request, Response } from "express";
import { createUtilityRateService, getCurrentRateService } from "./service.js";

async function create(req: Request, res: Response): Promise<void> {
  const view = await createUtilityRateService(req.user!.id, req.params.propertyId, req.body);
  res.status(201).json({ data: view });
}

async function get(req: Request, res: Response): Promise<void> {
  const view = await getCurrentRateService(req.user!.id, req.params.propertyId);
  res.status(200).json({ data: view });
}

export { create, get };

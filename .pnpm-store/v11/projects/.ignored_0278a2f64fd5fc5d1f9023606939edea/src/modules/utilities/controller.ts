import type { Request, Response } from "express";
import { createUtilityRateService, getRatesService } from "./service.js";

async function create(req: Request, res: Response): Promise<void> {
  const view = await createUtilityRateService(req.user!.id, req.params.propertyId, req.body);
  res.status(201).json({ data: view }); // the frontend gets the created upcoming view
}

async function get(req: Request, res: Response): Promise<void> {
  const views = await getRatesService(req.user!.id, req.params.propertyId);
  res.status(200).json({ data: views });
}

export { create, get };

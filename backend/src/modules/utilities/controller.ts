import type { Request, Response } from "express";
import { createUtilityRateService, getRatesService, deleteUtilityRateService } from "./service.js";

async function create(req: Request, res: Response): Promise<void> {
  const view = await createUtilityRateService(req.user!.id, req.params.propertyId, req.body);
  res.status(201).json({ data: view }); // the frontend gets the created upcoming view
}

async function get(req: Request, res: Response): Promise<void> {
  const views = await getRatesService(req.user!.id, req.params.propertyId);
  res.status(200).json({ data: views });
}

async function remove(req: Request, res: Response): Promise<void> {
  const result = await deleteUtilityRateService(req.user!.id, req.params.propertyId, req.params.id);
  res.status(200).json({ data: result });
}

export { create, get, remove };

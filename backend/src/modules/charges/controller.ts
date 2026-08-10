import type { Request, Response } from "express";
import { type Pagination } from "../../lib/pagination.js";
import {
  createSurchargeService,
  deleteSurchargeService,
  listSurchargesService,
  updateSurchargeService,
} from "./service.js";

async function create(req: Request, res: Response): Promise<void> {
  const view = await createSurchargeService(req.user!.id, req.params.propertyId, req.body);
  res.status(201).json({ data: view });
}

async function list(req: Request, res: Response): Promise<void> {
  const result = await listSurchargesService(
    req.user!.id,
    req.params.propertyId,
    req.query as unknown as Pagination,
  );
  res.status(200).json(result);
}

async function update(req: Request, res: Response): Promise<void> {
  const view = await updateSurchargeService(req.user!.id, req.params.id, req.body);
  res.status(200).json({ data: view });
}

async function remove(req: Request, res: Response): Promise<void> {
  const result = await deleteSurchargeService(req.user!.id, req.params.id);
  res.status(200).json({ data: result });
}

export { create, list, update, remove };

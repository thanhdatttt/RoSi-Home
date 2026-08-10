import type { Request, Response } from "express";
import { type Pagination } from "../../lib/pagination.js";
import {
  createPropertyService,
  getPropertyService,
  listPropertiesService,
  updatePropertyService,
} from "./service.js";

async function create(req: Request, res: Response): Promise<void> {
  const view = await createPropertyService(req.user!.id, req.body);
  res.status(201).json({ data: view });
}

async function list(req: Request, res: Response): Promise<void> {
  const result = await listPropertiesService(req.user!.id, req.query as unknown as Pagination);
  res.status(200).json(result);
}

async function get(req: Request, res: Response): Promise<void> {
  const view = await getPropertyService(req.user!.id, req.params.id);
  res.status(200).json({ data: view });
}

async function update(req: Request, res: Response): Promise<void> {
  const view = await updatePropertyService(req.user!.id, req.params.id, req.body);
  res.status(200).json({ data: view });
}

export { create, list, get, update };

import type { Request, Response } from "express";
import { type Pagination } from "../../lib/pagination.js";
import {
  archiveTenantService,
  getTenantService,
  listTenantsService,
  updateTenantService,
} from "./service.js";

async function list(req: Request, res: Response): Promise<void> {
  const result = await listTenantsService(req.user!.id, req.query as unknown as Pagination);
  res.status(200).json(result);
}

async function get(req: Request, res: Response): Promise<void> {
  const view = await getTenantService(req.user!.id, req.params.id);
  res.status(200).json({ data: view });
}

async function update(req: Request, res: Response): Promise<void> {
  const view = await updateTenantService(req.user!.id, req.params.id, req.body);
  res.status(200).json({ data: view });
}

async function archive(req: Request, res: Response): Promise<void> {
  const result = await archiveTenantService(req.user!.id, req.params.id);
  res.status(200).json({ data: result });
}

export { list, get, update, archive };

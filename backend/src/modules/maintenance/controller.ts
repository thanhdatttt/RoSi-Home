import type { Request, Response } from "express";
import type { Pagination } from "../../lib/pagination.js";
import {
  getTenantMaintenanceRequestService,
  listTenantMaintenanceRequestsService,
  submitMaintenanceRequestService,
} from "./service.js";

async function list(req: Request, res: Response): Promise<void> {
  const result = await listTenantMaintenanceRequestsService(
    req.user!.id,
    req.query as unknown as Pagination,
  );
  res.status(200).json(result);
}

async function get(req: Request, res: Response): Promise<void> {
  const view = await getTenantMaintenanceRequestService(
    req.user!.id,
    req.params.id,
  );
  res.status(200).json({ data: view });
}

async function submit(req: Request, res: Response): Promise<void> {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const view = await submitMaintenanceRequestService(
    req.user!.id,
    req.body,
    files.map((file) => ({
      originalName: file.originalname,
      declaredContentType: file.mimetype,
      buffer: file.buffer,
    })),
  );
  res.status(201).json({ data: view });
}

export { get, list, submit };

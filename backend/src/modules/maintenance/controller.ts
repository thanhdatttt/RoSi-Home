import type { Request, Response } from "express";
import type { Pagination } from "../../lib/pagination.js";
import {
  getMaintenanceRequestService,
  listMaintenanceRequestsService,
  submitMaintenanceRequestService,
} from "./service.js";
import type { MaintenanceRequestListQuery } from "./schema.js";

async function list(req: Request, res: Response): Promise<void> {
  const { propertyId, status, ...pagination } =
    req.query as unknown as MaintenanceRequestListQuery;
  const result = await listMaintenanceRequestsService(
    req.user!,
    pagination as Pagination,
    { propertyId, status },
  );
  res.status(200).json(result);
}

async function get(req: Request, res: Response): Promise<void> {
  const view = await getMaintenanceRequestService(
    req.user!,
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

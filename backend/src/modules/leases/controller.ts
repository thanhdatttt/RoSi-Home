import type { Request, Response } from "express";
import type { Pagination } from "../../lib/pagination.js";
import {
  createLeaseService,
  endLeaseService,
  getLeaseReminderConfigService,
  getLeaseService,
  listLeasesService,
  listUpcomingExpirationsService,
  updateLeaseReminderConfigService,
  updateOrRenewLeaseService,
} from "./service.js";

async function create(req: Request, res: Response): Promise<void> {
  const result = await createLeaseService(req.user!.id, req.body);
  res.status(201).json({ data: result.lease, meta: { tenantAccountProvisioned: result.tenantAccountProvisioned } });
}

async function list(req: Request, res: Response): Promise<void> {
  const { propertyId, ...pagination } = req.query as unknown as Pagination & { propertyId?: string };
  const result = await listLeasesService(req.user!, pagination, propertyId);
  res.status(200).json(result);
}

async function get(req: Request, res: Response): Promise<void> {
  const view = await getLeaseService(req.user!, req.params.id);
  res.status(200).json({ data: view });
}

async function update(req: Request, res: Response): Promise<void> {
  const view = await updateOrRenewLeaseService(req.user!.id, req.params.id, req.body);
  res.status(200).json({ data: view });
}

async function end(req: Request, res: Response): Promise<void> {
  const view = await endLeaseService(req.user!.id, req.params.id, req.body.actualEndDate);
  res.status(200).json({ data: view });
}

async function upcomingExpirations(req: Request, res: Response): Promise<void> {
  const view = await listUpcomingExpirationsService(req.user!.id);
  res.status(200).json({ data: view });
}

async function getReminderConfig(req: Request, res: Response): Promise<void> {
  const view = await getLeaseReminderConfigService(req.user!.id, req.params.propertyId);
  res.status(200).json({ data: view });
}

async function updateReminderConfig(req: Request, res: Response): Promise<void> {
  const view = await updateLeaseReminderConfigService(req.user!.id, req.params.propertyId, req.body);
  res.status(200).json({ data: view });
}

export { create, list, get, update, end, upcomingExpirations, getReminderConfig, updateReminderConfig };

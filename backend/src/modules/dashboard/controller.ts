import type { Request, Response } from "express";
import {
  getOccupancyService,
  getOutstandingSummaryService,
  getRevenueService,
  getUpcomingExpirationsService,
} from "./service.js";
import { ValidationError } from "../../lib/errors.js";

// US-DASH-03
async function outstanding(req: Request, res: Response): Promise<void> {
  const data = await getOutstandingSummaryService(req.user!.id);
  res.status(200).json({ data });
}

// US-DASH-04
async function upcomingExpirations(req: Request, res: Response): Promise<void> {
  const data = await getUpcomingExpirationsService(req.user!.id);
  res.status(200).json({ data });
}

// US-DASH-01
async function occupancy(req: Request, res: Response): Promise<void> {
  const data = await getOccupancyService(req.user!.id);
  res.status(200).json({ data });
}

// US-DASH-02
async function revenue(req: Request, res: Response): Promise<void> {
  const month = req.query.month;
  if (!month || typeof month !== "string" || !/^\d{4}-\d{2}$/.test(month)) {
    throw new ValidationError([{ field: "month", message: "Valid month (YYYY-MM) is required" }]);
  }
  const data = await getRevenueService(req.user!.id, month);
  res.status(200).json({ data });
}

export { outstanding, upcomingExpirations, occupancy, revenue };

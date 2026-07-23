import type { Request, Response } from "express";
import {
  getOutstandingSummaryService,
  getUpcomingExpirationsService,
} from "./service.js";

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

export { outstanding, upcomingExpirations };

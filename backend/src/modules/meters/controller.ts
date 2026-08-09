import type { Request, Response } from "express";
import {
  calculateMeterReadingsService,
  listMeterReadingsService,
  recordMeterReadingService,
  correctMeterReadingService,
} from "./service.js";

async function record(req: Request, res: Response): Promise<void> {
  const view = await recordMeterReadingService(
    req.user!.id,
    req.params.roomId,
    req.body,
  );
  res.status(201).json({ data: view });
}

async function list(req: Request, res: Response): Promise<void> {
  const view = await listMeterReadingsService(
    req.user!.id,
    req.params.roomId,
    String(req.query.billingPeriod),
  );
  res.status(200).json({ data: view });
}

async function calculate(req: Request, res: Response): Promise<void> {
  const view = await calculateMeterReadingsService(
    req.user!.id,
    req.params.roomId,
    req.body,
  );
  res.status(201).json({ data: view });
}

async function correct(req: Request, res: Response): Promise<void> {
  const view = await correctMeterReadingService(
    req.user!.id,
    req.params.id,
    req.body.correctedValue ?? req.body.value,
  );
  res.status(200).json({ data: view });
}

export { record, list, calculate, correct };

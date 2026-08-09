import type { Request, Response } from "express";
import {
<<<<<<< HEAD
  calculateMeterReadingsService,
  listMeterReadingsService,
=======
>>>>>>> origin/main
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

<<<<<<< HEAD
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

=======
>>>>>>> origin/main
async function correct(req: Request, res: Response): Promise<void> {
  const view = await correctMeterReadingService(
    req.user!.id,
    req.params.id,
<<<<<<< HEAD
    req.body.correctedValue ?? req.body.value,
=======
    req.body.value,
>>>>>>> origin/main
  );
  res.status(200).json({ data: view });
}

<<<<<<< HEAD
export { record, list, calculate, correct };
=======
export { record, correct };
>>>>>>> origin/main

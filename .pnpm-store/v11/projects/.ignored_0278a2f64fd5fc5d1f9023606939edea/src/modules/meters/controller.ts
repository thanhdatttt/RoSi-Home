import type { Request, Response } from "express";
import {
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

async function correct(req: Request, res: Response): Promise<void> {
  const view = await correctMeterReadingService(
    req.user!.id,
    req.params.id,
    req.body.value,
  );
  res.status(200).json({ data: view });
}

export { record, correct };

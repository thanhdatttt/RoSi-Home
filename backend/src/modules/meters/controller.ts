import type { Request, Response } from "express";
import {
  recordMeterReadingService,
  correctMeterReadingService,
  listMeterReadingsService,
} from "./service.js";
import type { MeterReadingListQuery } from "./schema.js";

async function list(req: Request, res: Response): Promise<void> {
  const result = await listMeterReadingsService(
    req.user!.id,
    req.params.roomId,
    req.query as unknown as MeterReadingListQuery,
  );
  res.status(200).json(result);
}

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

export { list, record, correct };

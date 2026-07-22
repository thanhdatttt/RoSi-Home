import type { Request, Response } from "express";
import { submitMaintenanceRequestService } from "./service.js";

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

export { submit };

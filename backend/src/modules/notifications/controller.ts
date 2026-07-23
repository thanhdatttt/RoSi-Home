import type { Request, Response } from "express";
import {
  registerDeviceTokenService,
  sendTestNotificationService,
  unregisterDeviceTokenService,
} from "./service.js";
import type { RegisterDeviceTokenInput, UnregisterDeviceTokenInput } from "./schema.js";

async function registerDeviceToken(req: Request, res: Response): Promise<void> {
  const input = req.body as RegisterDeviceTokenInput;
  const row = await registerDeviceTokenService(req.user!.id, input.pushToken, input.platform);
  res.status(201).json({ data: { id: row.id, platform: row.platform } });
}

async function unregisterDeviceToken(req: Request, res: Response): Promise<void> {
  const input = req.body as UnregisterDeviceTokenInput;
  await unregisterDeviceTokenService(req.user!.id, input.pushToken);
  res.status(200).json({ data: { success: true } });
}

async function sendTest(req: Request, res: Response): Promise<void> {
  const result = await sendTestNotificationService(req.user!.id);
  res.status(200).json({ data: result });
}

export { registerDeviceToken, unregisterDeviceToken, sendTest };

import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { registerDeviceTokenSchema, unregisterDeviceTokenSchema } from "./schema.js";
import { registerDeviceToken, sendTest, unregisterDeviceToken } from "./controller.js";

export const notificationsRouter = Router();

// Both Landlord and Tenant accounts register their own device — no role
// restriction here, only ownership (req.user!.id) inside the service layer.
notificationsRouter.use(requireAuth);

notificationsRouter.post(
  "/device-tokens",
  validate(registerDeviceTokenSchema),
  asyncHandler(registerDeviceToken),
);
notificationsRouter.delete(
  "/device-tokens",
  validate(unregisterDeviceTokenSchema),
  asyncHandler(unregisterDeviceToken),
);
// Manual test hook (not a numbered story) — lets the mobile app / QA
// confirm Expo push delivery end-to-end without waiting for a cron job.
notificationsRouter.post("/test", asyncHandler(sendTest));

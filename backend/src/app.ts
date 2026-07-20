import "dotenv/config";
import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./modules/auth/router.js";
import { profileRouter } from "./modules/profile/router.js";
import { propertiesRouter } from "./modules/properties/router.js";
import { roomsRouter } from "./modules/rooms/router.js";
import { tenantsRouter } from "./modules/tenants/router.js";
import { utilitiesRouter } from "./modules/utilities/router.js";
import { chargesRouter } from "./modules/charges/router.js";
import { leasesRouter } from "./modules/leases/router.js";
import { notificationsRouter } from "./modules/notifications/router.js";

export function createApp(): express.Express {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "rosihome-backend" });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/profile", profileRouter);
  app.use("/api/v1/properties", propertiesRouter);
  app.use("/api/v1/tenants", tenantsRouter);
  app.use("/api/v1/rooms", roomsRouter);
  app.use("/api/v1/utilities", utilitiesRouter);
  app.use("/api/v1/charges", chargesRouter);
  app.use("/api/v1/leases", leasesRouter);
  app.use("/api/v1/notifications", notificationsRouter);

  app.use(errorHandler);
  return app;
}

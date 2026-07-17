import "dotenv/config";
import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./modules/auth/router.js";

export function createApp(): express.Express {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "rosihome-backend" });
  });

  app.use("/api/v1/auth", authRouter);

  app.use(errorHandler);
  return app;
}

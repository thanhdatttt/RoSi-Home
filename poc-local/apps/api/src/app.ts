import cors from "cors";
import express, { type Express } from "express";
import type { DatabaseConnection } from "./db/client.js";
import { resetDatabase } from "./db/initialize.js";
import { HttpError } from "./lib/errors.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { createAuthRouter } from "./modules/auth/router.js";
import { createBillingRouter } from "./modules/billing/router.js";
import { createPropertyRouter } from "./modules/properties/router.js";

const allowedOrigins = new Set([
  "http://127.0.0.1:8082",
  "http://localhost:8082",
]);

export interface CreateAppOptions {
  database: DatabaseConnection;
  enablePocReset?: boolean;
  environment?: "development" | "test" | "production";
  jwtSecret: string;
}

export function createApp({
  database,
  enablePocReset = true,
  environment = "test",
  jwtSecret,
}: CreateAppOptions): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        callback(new HttpError(403, "ORIGIN_NOT_ALLOWED", "Origin is not allowed"));
      },
    }),
  );
  app.use(express.json({ limit: "32kb" }));

  app.get("/health", (_request, response) => {
    response.json({ status: "ok", storage: "pglite" });
  });

  app.use("/api/auth", createAuthRouter(database.db, jwtSecret));
  app.use("/api/properties", createPropertyRouter(database.db, jwtSecret));
  app.use("/api/billing", createBillingRouter(database.db, jwtSecret));

  if (environment !== "production" && enablePocReset) {
    app.post("/api/poc/reset", async (_request, response) => {
      await resetDatabase(database);
      response.json({ status: "reset" });
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

import { resolve } from "node:path";
import { config as loadEnvironment } from "dotenv";
import { z } from "zod";

const apiRoot = process.cwd();
loadEnvironment({ path: resolve(apiRoot, "../../.env"), quiet: true });

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  POC_API_HOST: z.enum(["127.0.0.1", "0.0.0.0"]).default("0.0.0.0"),
  POC_API_PORT: z.coerce.number().int().min(1).max(65_535).default(3100),
  POC_DATA_DIR: z.string().min(1).default("../../.data/rosihome-poc"),
  POC_JWT_SECRET: z
    .string()
    .min(16)
    .default("local-poc-development-secret-change-me"),
});

export type RuntimeEnvironment = z.infer<typeof environmentSchema>["NODE_ENV"];

export interface RuntimeConfig {
  dataDir: string;
  environment: RuntimeEnvironment;
  host: "127.0.0.1" | "0.0.0.0";
  jwtSecret: string;
  port: number;
}

export function getRuntimeConfig(): RuntimeConfig {
  const environment = environmentSchema.parse(process.env);

  if (
    environment.NODE_ENV === "production" &&
    environment.POC_JWT_SECRET === "local-poc-development-secret-change-me"
  ) {
    throw new Error("POC_JWT_SECRET must be replaced when NODE_ENV=production");
  }

  return {
    dataDir: resolve(apiRoot, environment.POC_DATA_DIR),
    environment: environment.NODE_ENV,
    host: environment.POC_API_HOST,
    jwtSecret: environment.POC_JWT_SECRET,
    port: environment.POC_API_PORT,
  };
}

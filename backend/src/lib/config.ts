import type { Request } from "express";

export type JwtClaims = {
  sub: string;
  role: "Landlord" | "Tenant";
  mustChangePassword: boolean;
  iat?: number;
  exp?: number;
};

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: "Landlord" | "Tenant" };
    }
  }
}

export function getEnv(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  get nodeEnv() {
    return getEnv("NODE_ENV", "development");
  },
  get databaseUrl() {
    return getEnv("DATABASE_URL");
  },
  get jwtSecret() {
    return getEnv("JWT_SECRET");
  },
  get jwtExpirySeconds() {
    return Number(getEnv("JWT_EXPIRY_SECONDS", "86400"));
  },
  get supabaseUrl() {
    return getEnv("SUPABASE_URL", "");
  },
  get supabaseServiceKey() {
    return getEnv("SUPABASE_SERVICE_KEY", "");
  },
  get firebaseServiceAccountJson() {
    return getEnv("FIREBASE_SERVICE_ACCOUNT_JSON", "");
  },
  get emailProviderApiKey() {
    return getEnv("EMAIL_PROVIDER_API_KEY", "");
  },
  get appPublicUrl() {
    return getEnv("APP_PUBLIC_URL", "https://rosihome.app");
  },
  get port() {
    return Number(getEnv("PORT", "3000"));
  },
};

export type { Request };

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
    return Number(getEnv("JWT_EXPIRY_SECONDS", "900"));
  },
  get jwtRefreshExpirySeconds() {
    return Number(getEnv("JWT_REFRESH_EXPIRY_SECONDS", "604800"));
  },
  get supabaseUrl() {
    return getEnv("SUPABASE_URL", "");
  },
  get supabaseServiceKey() {
    return getEnv("SUPABASE_SERVICE_KEY", "");
  },
  // Optional: enables Expo's "Enhanced Security for Push Notifications".
  // Not required to send push notifications via Expo's push service.
  get expoAccessToken() {
    return getEnv("EXPO_ACCESS_TOKEN", "");
  },
  get emailProviderApiKey() {
    return getEnv("EMAIL_PROVIDER_API_KEY", "");
  },
  get emailJS() {
    return {
      serviceId: getEnv("EMAILJS_SERVICE_ID", ""),
      templateId: getEnv("EMAILJS_TEMPLATE_ID", ""),
      publicKey: getEnv("EMAILJS_PUBLIC_KEY", ""),
      privateKey: getEnv("EMAILJS_PRIVATE_KEY", ""),
    };
  },
  get appPublicUrl() {
    return getEnv("APP_PUBLIC_URL", "https://rosihome.app");
  },
  get port() {
    return Number(getEnv("PORT", "3000"));
  },
  // Invoice calendar (US-INVOICE-01/04). Billing period is `YYYY-MM`. The
  // scheduled job targets the previous calendar month; issue/due days are the
  // day-of-month within the billing month.
  get invoiceIssueDay() {
    return Number(getEnv("INVOICE_ISSUE_DAY", "1"));
  },
  get invoiceDueDay() {
    return Number(getEnv("INVOICE_DUE_DAY", "5"));
  },
};

export type { Request };

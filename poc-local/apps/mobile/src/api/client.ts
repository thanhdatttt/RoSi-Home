const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
export const API_URL = (configuredUrl || "http://127.0.0.1:3100").replace(
  /\/$/,
  "",
);

export interface AuthenticatedUser {
  displayName: string;
  email: string;
  id: string;
  role: "Landlord";
}

export interface UtilityRates {
  electricityRate: number;
  updatedAt: string;
  waterRate: number;
}

export interface Property {
  address: string;
  createdAt: string;
  id: string;
  name: string;
  updatedAt: string;
  utilityRates: UtilityRates | null;
}

export interface InvoiceLineItem {
  amount: number;
  code: "BASE_RENT" | "ELECTRICITY" | "WATER";
  description: string;
  quantity?: string;
  rate?: number;
}

export interface Invoice {
  baseRent: number;
  billingPeriod: string;
  createdAt: string;
  currentElectricity: string;
  currentWater: string;
  dueDate: string;
  electricityCharge: number;
  electricityRate: number;
  id: string;
  inputFingerprint: string;
  issueDate: string;
  lineItems: InvoiceLineItem[];
  previousElectricity: string;
  previousWater: string;
  propertyId: string;
  roomReference: string;
  sentAt: string | null;
  status: "Draft" | "Sent";
  tenantName: string;
  total: number;
  waterCharge: number;
  waterRate: number;
}

export interface BankAccount {
  accountName: string;
  accountNumber: string;
  bankBin: string;
  landlordId: string;
  updatedAt: string;
}

export interface VietQrResult {
  amount: number;
  invoiceId: string;
  payload: string;
  qrDataUrl: string;
  remark: string;
  status: "Sent";
  structuralValidation: "passed";
}

interface ErrorPayload {
  error?: {
    code?: string;
    message?: string;
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers);
  headers.set("Accept", "application/json");
  if (requestOptions.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...requestOptions,
      headers,
    });
  } catch {
    throw new ApiError(
      `Không thể kết nối API local tại ${API_URL}. Hãy kiểm tra API, Wi-Fi và cấu hình EXPO_PUBLIC_API_URL.`,
      0,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError("API local trả về dữ liệu không hợp lệ.", response.status);
  }

  if (!response.ok) {
    const errorPayload = payload as ErrorPayload;
    throw new ApiError(
      errorPayload.error?.message ?? `API trả về lỗi ${response.status}.`,
      response.status,
    );
  }

  return payload as T;
}

export function login(email: string, password: string) {
  return request<{ token: string; user: AuthenticatedUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function listProperties(token: string): Promise<Property[]> {
  const result = await request<{ properties: Property[] }>("/api/properties", {
    token,
  });
  return result.properties;
}

export async function getProperty(token: string, id: string): Promise<Property> {
  const result = await request<{ property: Property }>(
    `/api/properties/${encodeURIComponent(id)}`,
    { token },
  );
  return result.property;
}

export async function createProperty(
  token: string,
  input: { address: string; name: string },
): Promise<Property> {
  const result = await request<{ property: Property }>("/api/properties", {
    token,
    method: "POST",
    body: JSON.stringify(input),
  });
  return result.property;
}

export async function updateUtilityRates(
  token: string,
  propertyId: string,
  input: { electricityRate: number; waterRate: number },
): Promise<Property> {
  const result = await request<{ property: Property }>(
    `/api/properties/${encodeURIComponent(propertyId)}/utility-rates`,
    {
      token,
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
  return result.property;
}

export async function getBankAccount(token: string): Promise<BankAccount | null> {
  const result = await request<{ bankAccount: BankAccount | null }>(
    "/api/billing/bank-account",
    { token },
  );
  return result.bankAccount;
}

export async function saveBankAccount(
  token: string,
  input: { accountName: string; accountNumber: string; bankBin: string },
): Promise<BankAccount> {
  const result = await request<{ bankAccount: BankAccount }>(
    "/api/billing/bank-account",
    { token, method: "PUT", body: JSON.stringify(input) },
  );
  return result.bankAccount;
}

export async function listInvoices(
  token: string,
  propertyId: string,
): Promise<Invoice[]> {
  const result = await request<{ invoices: Invoice[] }>(
    `/api/billing/invoices?propertyId=${encodeURIComponent(propertyId)}`,
    { token },
  );
  return result.invoices;
}

export async function generateInvoice(
  token: string,
  input: {
    baseRent: number;
    billingPeriod: string;
    currentElectricity: string;
    currentWater: string;
    dueDate: string;
    issueDate: string;
    previousElectricity: string;
    previousWater: string;
    propertyId: string;
    roomReference: string;
    tenantName: string;
  },
): Promise<{ invoice: Invoice; replayed: boolean }> {
  return request<{ invoice: Invoice; replayed: boolean }>("/api/billing/invoices", {
    token,
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function sendInvoice(token: string, invoiceId: string): Promise<Invoice> {
  const result = await request<{ invoice: Invoice }>(
    `/api/billing/invoices/${encodeURIComponent(invoiceId)}/send`,
    { token, method: "POST" },
  );
  return result.invoice;
}

export async function getInvoiceVietQr(
  token: string,
  invoiceId: string,
): Promise<VietQrResult> {
  const result = await request<{ vietqr: VietQrResult }>(
    `/api/billing/invoices/${encodeURIComponent(invoiceId)}/vietqr`,
    { token },
  );
  return result.vietqr;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
}

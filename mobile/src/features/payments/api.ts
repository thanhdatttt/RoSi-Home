import { apiRequest } from "@/lib/api";

export type PaymentProofFile = {
  uri: string;
  name: string;
  mimeType: "image/png" | "image/jpeg";
  fileSize?: number;
};

export type PaymentProof = {
  id: string;
  invoiceId: string;
  tenantInfoId: string;
  fileUrl: string;
  status: "Pending" | "Verified";
  uploadedAt: string;
};

export type VietQr = {
  payload: string;
  imageUrl: string;
  amount: number;
  description: string;
};

export type PaymentHistory = {
  entries: {
    invoiceId: string;
    amount: number;
    billingPeriod: string;
    status: "Sent" | "Paid";
    verifiedAt: string | null;
  }[];
  outstandingTotal: number;
};

export function getVietQr(token: string | null, invoiceId: string) {
  return apiRequest<VietQr>(`/invoices/${invoiceId}/vietqr`, { token });
}

export function getPaymentHistory(token: string | null) {
  return apiRequest<PaymentHistory>("/payments/history", { token });
}

export function uploadPaymentProof(
  token: string | null,
  invoiceId: string,
  file: PaymentProofFile,
) {
  const body = new FormData();
  body.append(
    "proof",
    { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob,
  );
  return apiRequest<PaymentProof>(`/invoices/${invoiceId}/payment-proofs`, {
    method: "POST",
    token,
    body,
    timeoutMs: 30_000,
  });
}

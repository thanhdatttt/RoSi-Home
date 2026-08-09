export type PaymentConfig = {
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
};

export type VietQr = {
  payload: string;
  imageUrl: string;
  amount: number;
  description: string;
};

export type PaymentProof = {
  id: string;
  invoiceId: string;
  fileUrl: string;
  status: 'Pending' | 'Verified';
  uploadedAt: string;
  invoice: {
    totalAmount: number;
    billingPeriod: string;
    status: 'Sent' | 'Paid';
  };
  room: { name: string };
  property: { name: string };
};

export type PaymentHistoryEntry = {
  invoiceId: string;
  amount: number;
  billingPeriod: string;
  status: 'Sent' | 'Paid';
  verifiedAt: string | null;
};

export type PaymentHistory = {
  entries: PaymentHistoryEntry[];
  outstandingTotal: number;
};

export type PaymentProofFile = {
  uri: string;
  name: string;
  mimeType: 'image/png' | 'image/jpeg';
};

export type ReminderConfig = {
  propertyId: string;
  overdueReminderEveryDays: number;
};

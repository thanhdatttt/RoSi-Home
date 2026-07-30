import { db } from "../../db/index.js";
import { paymentProofs, tenantInfo } from "../../db/schema.js";
import { writeAudit } from "../../db/audit.js";
import { NotFoundError, UnprocessableError } from "../../lib/errors.js";
import { sendNotification } from "../notifications/service.js";
import { getInvoiceDetail } from "./repository.js";
import { PaymentRepository } from "../payments/repository.js";
import { generateVietQR } from "../../lib/vietqr.js";
import { uploadPaymentProof } from "../../lib/storage.js";
import { eq } from "drizzle-orm";

export async function getVietqrService(actorId: string, role: "Landlord" | "Tenant", invoiceId: string) {
  const detail = await getInvoiceDetail(invoiceId);
  if (!detail) throw new NotFoundError("Invoice not found.");

  if (role === "Landlord") {
    if (detail.landlordId !== actorId) throw new NotFoundError("Invoice not found.");
  } else {
    if (detail.tenantUserId !== actorId) throw new NotFoundError("Invoice not found.");
    if (detail.status === "Draft") throw new NotFoundError("Invoice not found.");
  }

  if (detail.status !== "Sent" && detail.status !== "Paid") {
    throw new UnprocessableError("Invoice is not in a payable state.");
  }

  const config = await PaymentRepository.getPaymentConfig(detail.landlordId);
  if (!config) {
    throw new UnprocessableError("Landlord payment configuration is missing.");
  }

  const description = `Rent ${detail.propertyName} ${detail.roomName} ${detail.billingPeriod}`;

  const qr = await generateVietQR(
    config.bankCode,
    config.accountNumber,
    config.accountHolderName,
    detail.totalAmount,
    description
  );

  return {
    payload: qr.payload,
    imageUrl: qr.imageUrl,
    amount: detail.totalAmount,
    description,
  };
}

export async function uploadPaymentProofService(
  tenantUserId: string,
  invoiceId: string,
  fileBuffer: Buffer,
  contentType: "image/png" | "image/jpeg"
) {
  const detail = await getInvoiceDetail(invoiceId);
  if (!detail) throw new NotFoundError("Invoice not found.");
  if (detail.tenantUserId !== tenantUserId) throw new NotFoundError("Invoice not found.");
  if (detail.status !== "Sent") throw new UnprocessableError("Invoice is not payable.");

  const [tInfo] = await db
    .select({ id: tenantInfo.id })
    .from(tenantInfo)
    .where(eq(tenantInfo.userId, tenantUserId))
    .limit(1);
    
  if (!tInfo) throw new UnprocessableError("Tenant info missing.");

  const timestamp = Date.now();
  const objectPath = `${invoiceId}/${timestamp}-proof.${contentType === "image/png" ? "png" : "jpg"}`;
  
  const uploadResult = await uploadPaymentProof({
    objectPath,
    buffer: fileBuffer,
    contentType,
  });

  const [proof] = await db.insert(paymentProofs).values({
    invoiceId,
    tenantInfoId: tInfo.id,
    fileUrl: uploadResult.fileUrl,
    status: "Pending",
  }).returning();

  // Notify landlord
  await sendNotification({
    userId: detail.landlordId,
    type: "payment.proofUploaded",
    title: "Payment proof uploaded",
    body: `${detail.tenantName} uploaded payment proof for ${detail.roomName} (${detail.billingPeriod})`,
    linkRef: `invoices/${invoiceId}`,
  });

  return proof;
}

export async function confirmPaymentService(landlordId: string, invoiceId: string) {
  const detail = await getInvoiceDetail(invoiceId);
  if (!detail) throw new NotFoundError("Invoice not found.");
  if (detail.landlordId !== landlordId) throw new NotFoundError("Invoice not found.");
  if (detail.status === "Paid") {
    // Already paid, return existing per spec
    const existing = await PaymentRepository.getExistingPayment(invoiceId);
    return existing;
  }

  if (detail.status !== "Sent") {
    throw new UnprocessableError("Invoice cannot be paid.");
  }

  const payment = await PaymentRepository.createPayment(invoiceId, detail.totalAmount, landlordId);

  await writeAudit({
    actorUserId: landlordId,
    action: "payment.confirmed",
    entityType: "payments",
    entityId: payment.id,
    afterValue: { invoiceId, amount: detail.totalAmount },
  });

  return payment;
}

export async function sendManualReminderService(landlordId: string, invoiceId: string) {
  const detail = await getInvoiceDetail(invoiceId);
  if (!detail) throw new NotFoundError("Invoice not found.");
  if (detail.landlordId !== landlordId) throw new NotFoundError("Invoice not found.");
  if (detail.status !== "Sent") throw new UnprocessableError("Only Sent invoices can be reminded.");
  if (!detail.tenantUserId) throw new UnprocessableError("No tenant account to remind.");

  const dedupeKey = `reminder.manual:${invoiceId}:${Date.now()}`;
  
  await sendNotification({
    userId: detail.tenantUserId,
    type: "payment.overdue",
    title: "Payment Reminder",
    body: `Please remember to pay your invoice for ${detail.billingPeriod} at ${detail.propertyName} (${detail.totalAmount.toLocaleString("en-US")} VND).`,
    linkRef: `invoices/${invoiceId}`,
    dedupeKey,
  });

  await writeAudit({
    actorUserId: landlordId,
    action: "invoice.remind",
    entityType: "invoices",
    entityId: invoiceId,
  });

  return { success: true };
}

import { randomUUID } from "node:crypto";
import QRCode from "qrcode";
import { HttpError } from "../../lib/errors.js";
import { calculateInvoice } from "./calculation.js";
import type { BillingRepository, InvoiceRecord } from "./repository.js";
import type { BankAccountInput, GenerateInvoiceInput } from "./schema.js";
import {
  buildVietQrPayload,
  invoiceRemark,
  validateVietQrPayload,
} from "./vietqr.js";

export class BillingService {
  constructor(private readonly repository: BillingRepository) {}

  async generate(input: GenerateInvoiceInput, landlordId: string) {
    const property = await this.repository.findOwnedPropertyContext(
      input.propertyId,
      landlordId,
    );
    if (!property) {
      throw new HttpError(404, "PROPERTY_NOT_FOUND", "Property not found");
    }
    if (property.electricityRate === null || property.waterRate === null) {
      throw new HttpError(
        409,
        "UTILITY_RATES_REQUIRED",
        "Configure property utility rates before generating an invoice",
      );
    }

    const calculation = calculateInvoice(input, {
      electricityRate: property.electricityRate,
      waterRate: property.waterRate,
    });
    const candidate = await this.repository.insertInvoice({
      id: randomUUID(),
      propertyId: input.propertyId,
      roomReference: input.roomReference,
      tenantName: input.tenantName,
      billingPeriod: input.billingPeriod,
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      baseRent: input.baseRent,
      previousElectricity: calculation.inputSnapshot.previousElectricity,
      currentElectricity: calculation.inputSnapshot.currentElectricity,
      previousWater: calculation.inputSnapshot.previousWater,
      currentWater: calculation.inputSnapshot.currentWater,
      electricityRate: property.electricityRate,
      waterRate: property.waterRate,
      electricityCharge: calculation.electricityCharge,
      waterCharge: calculation.waterCharge,
      lineItems: calculation.lineItems,
      inputSnapshot: calculation.inputSnapshot,
      inputFingerprint: calculation.inputFingerprint,
      total: calculation.total,
      status: "Draft",
    });

    if (candidate) {
      return { invoice: candidate, replayed: false };
    }

    const existing = await this.repository.findByIdentity(
      input.propertyId,
      input.roomReference,
      input.billingPeriod,
    );
    if (existing?.inputFingerprint === calculation.inputFingerprint) {
      return { invoice: existing, replayed: true };
    }
    throw new HttpError(
      409,
      "INVOICE_ALREADY_EXISTS",
      "An invoice already exists for this property, room, and billing period with different input",
    );
  }

  async list(landlordId: string, propertyId?: string) {
    if (propertyId) {
      const property = await this.repository.findOwnedPropertyContext(propertyId, landlordId);
      if (!property) {
        throw new HttpError(404, "PROPERTY_NOT_FOUND", "Property not found");
      }
    }
    return this.repository.listOwnedInvoices(landlordId, propertyId);
  }

  async detail(id: string, landlordId: string): Promise<InvoiceRecord> {
    const invoice = await this.repository.findOwnedInvoice(id, landlordId);
    if (!invoice) {
      throw new HttpError(404, "INVOICE_NOT_FOUND", "Invoice not found");
    }
    return invoice;
  }

  async send(id: string, landlordId: string): Promise<InvoiceRecord> {
    const invoice = await this.detail(id, landlordId);
    if (invoice.status === "Sent") return invoice;
    const sent = await this.repository.markSent(id, new Date().toISOString());
    return sent ?? this.detail(id, landlordId);
  }

  async getBankAccount(landlordId: string) {
    return this.repository.getBankAccount(landlordId);
  }

  saveBankAccount(landlordId: string, input: BankAccountInput) {
    return this.repository.saveBankAccount(landlordId, input);
  }

  async vietQr(id: string, landlordId: string) {
    const invoice = await this.detail(id, landlordId);
    if (invoice.status !== "Sent") {
      throw new HttpError(
        409,
        "INVOICE_NOT_SENT",
        "Only a Sent invoice can generate VietQR",
      );
    }
    const bankAccount = await this.repository.getBankAccount(landlordId);
    if (!bankAccount) {
      throw new HttpError(
        409,
        "BANK_ACCOUNT_REQUIRED",
        "Configure local bank details before generating VietQR",
      );
    }
    const remark = invoiceRemark(invoice.roomReference, invoice.billingPeriod);
    const payload = buildVietQrPayload({
      accountNumber: bankAccount.accountNumber,
      amount: invoice.total,
      bankBin: bankAccount.bankBin,
      remark,
    });
    validateVietQrPayload(payload);
    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 320,
    });

    return {
      amount: invoice.total,
      invoiceId: invoice.id,
      payload,
      qrDataUrl,
      remark,
      status: invoice.status,
      structuralValidation: "passed" as const,
    };
  }
}

import { HttpError } from "../../lib/errors.js";

const NAPAS_AID = "A000000727";
const SERVICE_CODE = "QRIBFTTA";

function tlv(id: string, value: string): string {
  if (value.length > 99) {
    throw new HttpError(422, "VIETQR_FIELD_TOO_LONG", `VietQR field ${id} is too long`);
  }
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

export function crc16CcittFalse(value: string): string {
  let crc = 0xffff;
  for (const character of value) {
    crc ^= character.charCodeAt(0) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export interface VietQrInput {
  accountNumber: string;
  amount: number;
  bankBin: string;
  remark: string;
}

export function buildVietQrPayload(input: VietQrInput): string {
  const beneficiary = tlv("00", input.bankBin) + tlv("01", input.accountNumber);
  const merchantAccount =
    tlv("00", NAPAS_AID) + tlv("01", beneficiary) + tlv("02", SERVICE_CODE);
  const additionalData = tlv("08", input.remark);
  const body =
    tlv("00", "01") +
    tlv("01", "12") +
    tlv("38", merchantAccount) +
    tlv("53", "704") +
    tlv("54", input.amount.toString()) +
    tlv("58", "VN") +
    tlv("62", additionalData);
  const payloadWithCrcHeader = `${body}6304`;
  return payloadWithCrcHeader + crc16CcittFalse(payloadWithCrcHeader);
}

export function parseTlv(payload: string): Map<string, string> {
  const fields = new Map<string, string>();
  let cursor = 0;
  while (cursor < payload.length) {
    if (cursor + 4 > payload.length) {
      throw new HttpError(500, "VIETQR_INVALID_TLV", "VietQR TLV header is truncated");
    }
    const id = payload.slice(cursor, cursor + 2);
    const rawLength = payload.slice(cursor + 2, cursor + 4);
    if (!/^\d{2}$/.test(id) || !/^\d{2}$/.test(rawLength)) {
      throw new HttpError(500, "VIETQR_INVALID_TLV", "VietQR TLV header is invalid");
    }
    const length = Number(rawLength);
    const start = cursor + 4;
    const end = start + length;
    if (end > payload.length || fields.has(id)) {
      throw new HttpError(500, "VIETQR_INVALID_TLV", "VietQR TLV field is invalid");
    }
    fields.set(id, payload.slice(start, end));
    cursor = end;
  }
  return fields;
}

export function validateVietQrPayload(payload: string): void {
  const fields = parseTlv(payload);
  const merchantAccount = parseTlv(fields.get("38") ?? "");
  const beneficiary = parseTlv(merchantAccount.get("01") ?? "");
  const additionalData = parseTlv(fields.get("62") ?? "");
  const expectedCrc = crc16CcittFalse(payload.slice(0, -4));

  const valid =
    fields.get("00") === "01" &&
    fields.get("01") === "12" &&
    merchantAccount.get("00") === NAPAS_AID &&
    merchantAccount.get("02") === SERVICE_CODE &&
    /^\d{6}$/.test(beneficiary.get("00") ?? "") &&
    /^[A-Za-z0-9]{5,19}$/.test(beneficiary.get("01") ?? "") &&
    fields.get("53") === "704" &&
    /^\d{1,13}$/.test(fields.get("54") ?? "") &&
    fields.get("58") === "VN" &&
    /^[A-Z0-9. ]{1,25}$/.test(additionalData.get("08") ?? "") &&
    fields.get("63") === expectedCrc;

  if (!valid) {
    throw new HttpError(500, "VIETQR_VALIDATION_FAILED", "Generated VietQR failed local validation");
  }
}

export function invoiceRemark(roomReference: string, billingPeriod: string): string {
  const remark = `ROSI ${roomReference} ${billingPeriod.replace("-", "")}`;
  if (!/^[A-Z0-9. ]{1,25}$/.test(remark)) {
    throw new HttpError(422, "VIETQR_REMARK_INVALID", "Invoice remark is not VietQR-safe");
  }
  return remark;
}

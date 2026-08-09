import QRCode from "qrcode";

export const VIETQR_BANK_BINS = {
  VCB: "970436",
  TCB: "970407",
  MB: "970422",
  VPB: "970432",
  ACB: "970416",
  STB: "970403",
  BIDV: "970418",
  CTG: "970415",
  VIB: "970441",
  TPB: "970423",
  HDB: "970437",
} as const;

export type VietQrBankCode = keyof typeof VIETQR_BANK_BINS;

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) > 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

function formatField(id: string, value: string): string {
  const len = Buffer.byteLength(value, "utf8").toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function normalizeText(value: string, maxLength: number): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Đ/g, "D")
    .replace(/đ/g, "d")
    .toUpperCase()
    .replace(/[^A-Z0-9. ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export async function generateVietQR(
  bankCode: string,
  accountNumber: string,
  accountName: string,
  amount: number,
  description: string
): Promise<{ payload: string; imageUrl: string; description: string }> {
  const normalizedBankCode = bankCode.trim().toUpperCase() as VietQrBankCode;
  const bin = VIETQR_BANK_BINS[normalizedBankCode];
  if (!bin) throw new Error("Unsupported VietQR bank code.");
  if (!/^[A-Z0-9]{5,19}$/.test(accountNumber)) {
    throw new Error("Invalid VietQR account number.");
  }
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 9_999_999_999_999) {
    throw new Error("Invalid VietQR amount.");
  }

  const subTag00 = formatField("00", "A000000727");
  const subTag01 = formatField("01", formatField("00", bin) + formatField("01", accountNumber));
  const subTag02 = formatField("02", "QRIBFTTA");
  
  const tag38 = formatField("38", subTag00 + subTag01 + subTag02);
  
  const tag53 = formatField("53", "704");
  const tag54 = formatField("54", amount.toString());
  const tag58 = formatField("58", "VN");
  const tag59 = formatField("59", normalizeText(accountName, 25));
  const tag60 = formatField("60", "VN");

  const encodedDescription = normalizeText(description, 25);
  const subTag62_08 = formatField("08", encodedDescription);
  const tag62 = formatField("62", subTag62_08);
  
  let payload = 
    formatField("00", "01") + // Payload Format Indicator
    formatField("01", "12") + // Point of Initiation Method: 12 (Dynamic)
    tag38 +
    tag53 +
    tag54 +
    tag58 +
    tag59 +
    tag60 +
    tag62 +
    "6304"; // CRC ID and Length
    
  const crc = crc16(payload);
  payload += crc;

  const imageUrl = await QRCode.toDataURL(payload);

  return { payload, imageUrl, description: encodedDescription };
}

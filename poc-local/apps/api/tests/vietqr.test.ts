import { describe, expect, it } from "vitest";
import {
  buildVietQrPayload,
  crc16CcittFalse,
  parseTlv,
  validateVietQrPayload,
} from "../src/modules/billing/vietqr.js";

describe("local VietQR encoder", () => {
  it("matches the CRC16-CCITT-FALSE standard check value", () => {
    expect(crc16CcittFalse("123456789")).toBe("29B1");
  });

  it("builds a deterministic NAPAS account-transfer payload", () => {
    const input = {
      accountNumber: "1017595600",
      amount: 4_085_744,
      bankBin: "970436",
      remark: "ROSI P.101 202607",
    };
    const first = buildVietQrPayload(input);
    const second = buildVietQrPayload(input);

    expect(first).toBe(second);
    expect(() => validateVietQrPayload(first)).not.toThrow();
    const fields = parseTlv(first);
    expect(fields.get("00")).toBe("01");
    expect(fields.get("01")).toBe("12");
    expect(fields.get("53")).toBe("704");
    expect(fields.get("54")).toBe("4085744");
    expect(fields.get("58")).toBe("VN");
  });

  it("rejects a payload whose CRC was altered", () => {
    const payload = buildVietQrPayload({
      accountNumber: "1017595600",
      amount: 100_000,
      bankBin: "970436",
      remark: "ROSI P.1 202607",
    });
    const corrupted = `${payload.slice(0, -1)}${payload.endsWith("0") ? "1" : "0"}`;
    expect(() => validateVietQrPayload(corrupted)).toThrow(
      "Generated VietQR failed local validation",
    );
  });
});

import { describe, expect, it } from "vitest";

import { generateVietQR } from "../../../src/lib/vietqr.js";

function crc16(data: string): string {
  let crc = 0xffff;
  for (const character of data) {
    crc ^= character.charCodeAt(0) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) > 0 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

describe("generateVietQR", () => {
  it("encodes the selected bank BIN, amount, description and a valid CRC", async () => {
    const result = await generateVietQR(
      "TCB",
      "123456789",
      "NGUYỄN VĂN A",
      5_500_000,
      "RH Room 1 2025-01 abc123",
    );

    expect(result.payload).toContain("970407");
    expect(result.payload).toContain("54075500000");
    expect(result.payload).toContain("NGUYEN VAN A");
    expect(result.description).toBe("RH ROOM 1 2025 01 ABC123");
    expect(result.payload).toContain(result.description);
    expect(result.payload.slice(-4)).toBe(crc16(result.payload.slice(0, -4)));
    expect(result.imageUrl).toMatch(/^data:image\/png;base64,/);
  });

  it("rejects an unsupported bank instead of silently using another account", async () => {
    await expect(
      generateVietQR("UNKNOWN", "123456789", "A B", 100_000, "RH 1"),
    ).rejects.toThrow("Unsupported VietQR bank code");
  });
});

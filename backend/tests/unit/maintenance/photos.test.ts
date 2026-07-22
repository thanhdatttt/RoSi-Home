import { describe, expect, it } from "vitest";
import { validateMaintenancePhotos } from "../../../src/modules/maintenance/photos.js";

function file(
  originalname: string,
  mimetype: string,
  buffer: Buffer,
): Express.Multer.File {
  return {
    fieldname: "photos",
    originalname,
    encoding: "7bit",
    mimetype,
    size: buffer.length,
    destination: "",
    filename: "",
    path: "",
    buffer,
    stream: undefined as never,
  };
}

const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]);

describe("validateMaintenancePhotos", () => {
  it("US-MAINT-01: accepts PNG and JPEG files whose extension and bytes agree", () => {
    const result = validateMaintenancePhotos([
      file("issue.png", "image/png", png),
      file("detail.JPEG", "image/jpeg", jpeg),
    ]);

    expect(result).toEqual([
      expect.objectContaining({ extension: "png", contentType: "image/png" }),
      expect.objectContaining({ extension: "jpeg", contentType: "image/jpeg" }),
    ]);
  });

  it("US-MAINT-01: rejects an image with spoofed MIME bytes", () => {
    expect(() =>
      validateMaintenancePhotos([
        file("issue.png", "image/png", Buffer.from("not-an-image")),
      ]),
    ).toThrowError(
      expect.objectContaining({
        status: 400,
        code: "VALIDATION_ERROR",
        fields: [expect.objectContaining({ field: "photos.0" })],
      }),
    );
  });

  it("US-MAINT-01: rejects an image larger than 5 MB", () => {
    const oversized = Buffer.concat([png, Buffer.alloc(5 * 1024 * 1024)]);
    expect(() =>
      validateMaintenancePhotos([file("issue.png", "image/png", oversized)]),
    ).toThrowError(expect.objectContaining({ status: 400 }));
  });

  it("US-MAINT-01: rejects an extension outside the approved list", () => {
    expect(() =>
      validateMaintenancePhotos([file("issue.gif", "image/gif", png)]),
    ).toThrowError(expect.objectContaining({ status: 400 }));
  });

  it("US-MAINT-01: rejects a valid image whose extension does not match its bytes", () => {
    expect(() =>
      validateMaintenancePhotos([file("issue.jpg", "image/jpeg", png)]),
    ).toThrowError(expect.objectContaining({ status: 400 }));
  });

  it("US-MAINT-01: rejects more than three photos", () => {
    expect(() =>
      validateMaintenancePhotos([
        file("1.png", "image/png", png),
        file("2.png", "image/png", png),
        file("3.png", "image/png", png),
        file("4.png", "image/png", png),
      ]),
    ).toThrowError(expect.objectContaining({ status: 400 }));
  });
});

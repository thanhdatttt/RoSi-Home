import { extname } from "node:path";
import { ValidationError } from "../../lib/errors.js";

export const MAX_MAINTENANCE_PHOTOS = 3;
export const MAX_MAINTENANCE_PHOTO_BYTES = 5 * 1024 * 1024;

export type MaintenancePhotoInput = {
  originalName: string;
  declaredContentType: string;
  buffer: Buffer;
};

type MulterLikePhoto = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

export type ValidatedMaintenancePhoto = {
  originalName: string;
  extension: "png" | "jpg" | "jpeg";
  contentType: "image/png" | "image/jpeg";
  buffer: Buffer;
};

function validationError(index: number, message: string): ValidationError {
  return new ValidationError([{ field: `photos.${index}`, message }]);
}

function isPng(buffer: Buffer): boolean {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  return (
    buffer.length >= signature.length &&
    signature.every((byte, index) => buffer[index] === byte)
  );
}

function isJpeg(buffer: Buffer): boolean {
  return (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  );
}

function normalizeInput(
  photo: MaintenancePhotoInput | MulterLikePhoto,
): MaintenancePhotoInput {
  if ("originalName" in photo) return photo;
  return {
    originalName: photo.originalname,
    declaredContentType: photo.mimetype,
    buffer: photo.buffer,
  };
}

/**
 * Validates the complete batch before any storage call is allowed. MIME is
 * detected from magic bytes and must agree with both the extension and the
 * multipart Content-Type supplied by the client.
 */
export function validateMaintenancePhotos(
  input: readonly (MaintenancePhotoInput | MulterLikePhoto)[],
): ValidatedMaintenancePhoto[] {
  if (input.length > MAX_MAINTENANCE_PHOTOS) {
    throw new ValidationError([
      { field: "photos", message: "A maximum of 3 photos is allowed." },
    ]);
  }

  return input.map((rawPhoto, index) => {
    const photo = normalizeInput(rawPhoto);
    if (photo.buffer.length > MAX_MAINTENANCE_PHOTO_BYTES) {
      throw validationError(index, "Each photo must be 5 MB or smaller.");
    }

    const extension = extname(photo.originalName).slice(1).toLowerCase();
    if (extension !== "png" && extension !== "jpg" && extension !== "jpeg") {
      throw validationError(index, "Only .png, .jpg, and .jpeg photos are allowed.");
    }

    const detectedContentType = isPng(photo.buffer)
      ? "image/png"
      : isJpeg(photo.buffer)
        ? "image/jpeg"
        : null;
    if (!detectedContentType) {
      throw validationError(index, "The file content is not a valid PNG or JPEG image.");
    }

    const expectedContentType = extension === "png" ? "image/png" : "image/jpeg";
    if (
      detectedContentType !== expectedContentType ||
      photo.declaredContentType.toLowerCase() !== expectedContentType
    ) {
      throw validationError(
        index,
        "The photo extension, Content-Type, and file content must match.",
      );
    }

    return {
      originalName: photo.originalName,
      extension,
      contentType: detectedContentType,
      buffer: photo.buffer,
    };
  });
}

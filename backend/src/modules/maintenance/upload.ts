import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ValidationError } from "../../lib/errors.js";
import {
  MAX_MAINTENANCE_PHOTO_BYTES,
  MAX_MAINTENANCE_PHOTOS,
} from "./photos.js";

const multipart = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: MAX_MAINTENANCE_PHOTOS,
    fileSize: MAX_MAINTENANCE_PHOTO_BYTES,
    fields: 3,
    fieldSize: 64 * 1024,
  },
});

function multerValidationError(error: multer.MulterError): ValidationError {
  if (error.code === "LIMIT_FILE_SIZE") {
    return new ValidationError([
      { field: "photos", message: "Each photo must be 5 MB or smaller." },
    ]);
  }
  if (error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE") {
    return new ValidationError([
      { field: "photos", message: "A maximum of 3 photos is allowed." },
    ]);
  }
  return new ValidationError([
    { field: "photos", message: "The multipart photo upload is invalid." },
  ]);
}

export function uploadMaintenancePhotos(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  multipart.any()(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      return next(multerValidationError(error));
    }
    if (error) return next(error);

    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const unexpected = files.find(
      (file) => file.fieldname !== "photos" && file.fieldname !== "photos[]",
    );
    if (unexpected) {
      return next(
        new ValidationError([
          { field: unexpected.fieldname, message: "Unexpected file field." },
        ]),
      );
    }
    next();
  });
}

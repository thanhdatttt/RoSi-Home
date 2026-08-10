import { z } from "zod";

export const createRoomSchema = z
  .object({
    name: z.string().min(1, "Name is required."),
    baseRent: z.number().int("Base rent must be a whole number.").min(0, "Base rent cannot be negative."),
  })
  .strict();

export const updateRoomSchema = z
  .object({
    name: z.string().min(1, "Name is required.").optional(),
    // `status`/`occupancy` is intentionally NOT accepted here (architecture §4.6):
    // room occupancy is derived at query time and can never be overridden.
    baseRent: z
      .number()
      .int("Base rent must be a whole number.")
      .min(0, "Base rent cannot be negative.")
      .optional(),
  })
  .strict();

export const bulkRoomsSchema = z
  .object({
    rooms: z
      .array(
        z
          .object({
            name: z.string().min(1, "Name is required.").optional(),
            baseRent: z
              .number()
              .int("Base rent must be a whole number.")
              .min(0, "Base rent cannot be negative."),
          })
          .strict(),
      )
      .min(1, "At least one room is required.")
      .max(50, "A maximum of 50 rooms can be created at once."),
  })
  .strict();

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type BulkRoomsInput = z.infer<typeof bulkRoomsSchema>;

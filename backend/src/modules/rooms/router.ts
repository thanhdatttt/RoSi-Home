import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { paginationQuerySchema } from "../../lib/pagination.js";
import {
  createRoomSchema,
  updateRoomSchema,
  bulkRoomsSchema,
} from "./schema.js";
import { create, bulk, list, get, update } from "./controller.js";

export const roomsRouter = Router();

roomsRouter.use(requireAuth, requireRole("Landlord"));

roomsRouter.post(
  "/properties/:propertyId/rooms",
  validate(createRoomSchema),
  asyncHandler(create),
);
roomsRouter.post(
  "/properties/:propertyId/rooms/bulk",
  validate(bulkRoomsSchema),
  asyncHandler(bulk),
);
roomsRouter.get(
  "/properties/:propertyId/rooms",
  validate(paginationQuerySchema, "query"),
  asyncHandler(list),
);
roomsRouter.get("/rooms/:id", asyncHandler(get));
roomsRouter.patch("/rooms/:id", validate(updateRoomSchema), asyncHandler(update));

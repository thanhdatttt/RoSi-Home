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
  "/properties/:propertyId",
  validate(createRoomSchema),
  asyncHandler(create),
);
roomsRouter.post(
  "/properties/:propertyId/bulk",
  validate(bulkRoomsSchema),
  asyncHandler(bulk),
);
roomsRouter.get(
  "/properties/:propertyId",
  validate(paginationQuerySchema, "query"),
  asyncHandler(list),
);
roomsRouter.get("/:id", asyncHandler(get));
roomsRouter.patch("/:id", validate(updateRoomSchema), asyncHandler(update));

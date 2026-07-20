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

// NOTE: requireRole is applied per-route, not as a blanket router.use();
// see the comment in meters/router.ts for why a router-level role check
// is unsafe when multiple routers share the bare "/api/v1" prefix.
roomsRouter.use(requireAuth);

roomsRouter.post(
  "/properties/:propertyId/rooms",
  requireRole("Landlord"),
  validate(createRoomSchema),
  asyncHandler(create),
);
roomsRouter.post(
  "/properties/:propertyId/rooms/bulk",
  requireRole("Landlord"),
  validate(bulkRoomsSchema),
  asyncHandler(bulk),
);
roomsRouter.get(
  "/properties/:propertyId/rooms",
  requireRole("Landlord"),
  validate(paginationQuerySchema, "query"),
  asyncHandler(list),
);
roomsRouter.get("/rooms/:id", requireRole("Landlord"), asyncHandler(get));
roomsRouter.patch(
  "/rooms/:id",
  requireRole("Landlord"),
  validate(updateRoomSchema),
  asyncHandler(update),
);

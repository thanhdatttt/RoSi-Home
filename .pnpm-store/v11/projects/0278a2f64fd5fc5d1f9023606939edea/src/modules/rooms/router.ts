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
// is unsafe when multiple routers could match the same prefix.
roomsRouter.use(requireAuth);

roomsRouter.post(
  "/properties/:propertyId",
  requireRole("Landlord"),
  validate(createRoomSchema),
  asyncHandler(create),
);
roomsRouter.post(
  "/properties/:propertyId/bulk",
  requireRole("Landlord"),
  validate(bulkRoomsSchema),
  asyncHandler(bulk),
);
roomsRouter.get(
  "/properties/:propertyId",
  requireRole("Landlord"),
  validate(paginationQuerySchema, "query"),
  asyncHandler(list),
);
roomsRouter.get("/:id", requireRole("Landlord"), asyncHandler(get));
roomsRouter.patch(
  "/:id",
  requireRole("Landlord"),
  validate(updateRoomSchema),
  asyncHandler(update),
);

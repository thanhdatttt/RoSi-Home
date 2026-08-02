import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { occupancy, outstanding, revenue, upcomingExpirations } from "./controller.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);
dashboardRouter.use(requireRole("Landlord"));

// US-DASH-01
dashboardRouter.get("/occupancy", asyncHandler(occupancy));

// US-DASH-02
dashboardRouter.get("/revenue", asyncHandler(revenue));

// US-DASH-03
dashboardRouter.get("/outstanding", asyncHandler(outstanding));

// US-DASH-04
dashboardRouter.get("/upcoming-expirations", asyncHandler(upcomingExpirations));

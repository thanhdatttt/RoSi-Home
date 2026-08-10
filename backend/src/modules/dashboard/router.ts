import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { occupancy, outstanding, revenue, upcomingExpirations, tenantDashboard } from "./controller.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

// TENANT DASHBOARD
dashboardRouter.get("/tenant", requireRole("Tenant"), asyncHandler(tenantDashboard));

// LANDLORD DASHBOARD
const landlordDashboardRouter = Router();
landlordDashboardRouter.use(requireRole("Landlord"));

// US-DASH-01
landlordDashboardRouter.get("/occupancy", asyncHandler(occupancy));

// US-DASH-02
landlordDashboardRouter.get("/revenue", asyncHandler(revenue));

// US-DASH-03
landlordDashboardRouter.get("/outstanding", asyncHandler(outstanding));

// US-DASH-04
landlordDashboardRouter.get("/upcoming-expirations", asyncHandler(upcomingExpirations));

dashboardRouter.use(landlordDashboardRouter);

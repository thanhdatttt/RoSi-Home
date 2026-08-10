import { Router } from "express";
import { getProfile, updateProfile } from "./controller.js";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { updateProfileSchema } from "./schema.js";

export const profileRouter = Router();

profileRouter.use(requireAuth);
profileRouter.get("/", asyncHandler(getProfile));
profileRouter.patch("/", validate(updateProfileSchema), asyncHandler(updateProfile));

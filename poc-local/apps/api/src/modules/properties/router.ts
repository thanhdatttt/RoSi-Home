import { Router } from "express";
import type { AppDrizzle } from "../../db/client.js";
import {
  getAuthenticatedUser,
  requireAuthentication,
} from "../../middleware/auth.js";
import { PropertyRepository } from "./repository.js";
import {
  createPropertyInputSchema,
  utilityRateInputSchema,
} from "./schema.js";
import { PropertyService } from "./service.js";

export function createPropertyRouter(db: AppDrizzle, jwtSecret: string): Router {
  const router = Router();
  const service = new PropertyService(new PropertyRepository(db));

  router.use(requireAuthentication(jwtSecret));

  router.get("/", async (request, response) => {
    const user = getAuthenticatedUser(request);
    response.json({ properties: await service.list(user.userId) });
  });

  router.post("/", async (request, response) => {
    const user = getAuthenticatedUser(request);
    const input = createPropertyInputSchema.parse(request.body);
    response.status(201).json({ property: await service.create(user.userId, input) });
  });

  router.get("/:id", async (request, response) => {
    const user = getAuthenticatedUser(request);
    response.json({
      property: await service.detail(request.params.id, user.userId),
    });
  });

  router.put("/:id/utility-rates", async (request, response) => {
    const user = getAuthenticatedUser(request);
    const input = utilityRateInputSchema.parse(request.body);
    response.json({
      property: await service.updateUtilityRates(
        request.params.id,
        user.userId,
        input,
      ),
    });
  });

  return router;
}

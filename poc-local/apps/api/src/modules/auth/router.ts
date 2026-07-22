import { Router } from "express";
import type { AppDrizzle } from "../../db/client.js";
import { AuthRepository } from "./repository.js";
import { loginInputSchema } from "./schema.js";
import { AuthService } from "./service.js";

export function createAuthRouter(db: AppDrizzle, jwtSecret: string): Router {
  const router = Router();
  const service = new AuthService(new AuthRepository(db), jwtSecret);

  router.post("/login", async (request, response) => {
    const input = loginInputSchema.parse(request.body);
    response.json(await service.login(input));
  });

  return router;
}

import { Router } from "express";
import type { AppDrizzle } from "../../db/client.js";
import {
  getAuthenticatedUser,
  requireAuthentication,
} from "../../middleware/auth.js";
import { BillingRepository } from "./repository.js";
import {
  bankAccountInputSchema,
  generateInvoiceInputSchema,
  invoiceIdSchema,
  invoiceListQuerySchema,
} from "./schema.js";
import { BillingService } from "./service.js";

export function createBillingRouter(db: AppDrizzle, jwtSecret: string): Router {
  const router = Router();
  const service = new BillingService(new BillingRepository(db));

  router.use(requireAuthentication(jwtSecret));

  router.get("/bank-account", async (request, response) => {
    const user = getAuthenticatedUser(request);
    response.json({ bankAccount: await service.getBankAccount(user.userId) });
  });

  router.put("/bank-account", async (request, response) => {
    const user = getAuthenticatedUser(request);
    const input = bankAccountInputSchema.parse(request.body);
    response.json({ bankAccount: await service.saveBankAccount(user.userId, input) });
  });

  router.get("/invoices", async (request, response) => {
    const user = getAuthenticatedUser(request);
    const query = invoiceListQuerySchema.parse(request.query);
    response.json({ invoices: await service.list(user.userId, query.propertyId) });
  });

  router.post("/invoices", async (request, response) => {
    const user = getAuthenticatedUser(request);
    const input = generateInvoiceInputSchema.parse(request.body);
    const result = await service.generate(input, user.userId);
    response.status(result.replayed ? 200 : 201).json(result);
  });

  router.get("/invoices/:id", async (request, response) => {
    const user = getAuthenticatedUser(request);
    const id = invoiceIdSchema.parse(request.params.id);
    response.json({ invoice: await service.detail(id, user.userId) });
  });

  router.post("/invoices/:id/send", async (request, response) => {
    const user = getAuthenticatedUser(request);
    const id = invoiceIdSchema.parse(request.params.id);
    response.json({ invoice: await service.send(id, user.userId) });
  });

  router.get("/invoices/:id/vietqr", async (request, response) => {
    const user = getAuthenticatedUser(request);
    const id = invoiceIdSchema.parse(request.params.id);
    response.json({ vietqr: await service.vietQr(id, user.userId) });
  });

  return router;
}

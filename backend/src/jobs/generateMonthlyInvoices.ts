import { generateMonthlyInvoicesForAll } from "../modules/invoices/service.js";

// US-INVOICE-01 — scheduled monthly invoice generation. Errors are left to
// propagate so the single cron-level .catch in jobs/index.ts handles logging.
export async function generateMonthlyInvoices(): Promise<void> {
  const result = await generateMonthlyInvoicesForAll();
  console.info(
    `[generateMonthlyInvoices] period processed: ${result.properties} properties, ${result.generated} generated, ${result.skipped} skipped.`,
  );
}

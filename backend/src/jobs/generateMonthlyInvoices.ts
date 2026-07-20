import { generateMonthlyInvoicesForAll } from "../modules/invoices/service.js";

// US-INVOICE-01 — scheduled monthly invoice generation.
export async function generateMonthlyInvoices(): Promise<void> {
  try {
    const result = await generateMonthlyInvoicesForAll();
    console.info(
      `[generateMonthlyInvoices] period processed: ${result.properties} properties, ${result.generated} generated, ${result.skipped} skipped.`,
    );
  } catch (err) {
    console.error("[generateMonthlyInvoices] failed:", err);
  }
}

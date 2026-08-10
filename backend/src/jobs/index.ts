import { schedule } from "node-cron";

import { generateMonthlyInvoices } from "./generateMonthlyInvoices.js";
import { sendOverdueReminders } from "./sendOverdueReminders.js";
import { sendLeaseExpirationReminders } from "./sendLeaseExpirationReminders.js";

export function registerJobs(): void {
  schedule("0 2 * * *", () => {
    void generateMonthlyInvoices().catch((e) => console.error("[job:generateMonthlyInvoices]", e));
  });
  schedule("0 6 * * *", () => {
    void sendOverdueReminders().catch((e) => console.error("[job:sendOverdueReminders]", e));
  });
  schedule("0 7 * * *", () => {
    void sendLeaseExpirationReminders().catch((e) =>
      console.error("[job:sendLeaseExpirationReminders]", e),
    );
  });
}

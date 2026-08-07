import "dotenv/config";
import { db } from "../src/db/index.js";
import { leases, properties, leaseReminderConfigs } from "../src/db/schema.js";
import { sendLeaseExpirationReminders } from "../src/jobs/sendLeaseExpirationReminders.js";
import { listEnabledReminderConfigs, findActiveLeasesEndingOn } from "../src/modules/leases/repository.js";
import { businessDate } from "../src/lib/businessDate.js";
import { addDays } from "../src/modules/leases/rules.js";

async function check() {
  const allLeases = await db.select().from(leases);
  console.log("All leases:", allLeases.map(l => ({ id: l.id, status: l.status, endDate: l.endDate })));
  
  const allConfigs = await db.select().from(leaseReminderConfigs);
  console.log("All configs:", allConfigs);

  const configs = await listEnabledReminderConfigs();
  console.log("Enabled configs returned by repo:", configs);

  const today = businessDate();
  console.log("Today is:", today);
  const targetDate = addDays(today, 30);
  console.log("Target date is:", targetDate);

  for (const cfg of configs) {
    if (cfg.remindAt30Days) {
      const endingLeases = await findActiveLeasesEndingOn(cfg.propertyId, targetDate);
      console.log(`Ending leases for property ${cfg.propertyId} on ${targetDate}:`, endingLeases);
    }
  }

  console.log("Running job manually again just in case...");
  await sendLeaseExpirationReminders();
  
  const { notifications } = await import("../src/db/schema.js");
  const notifs = await db.select().from(notifications);
  console.log("Notifications in DB:", notifs.map(n => ({ id: n.id, title: n.title, dedupeKey: n.dedupeKey })));
  
  process.exit(0);
}

check().catch(console.error);

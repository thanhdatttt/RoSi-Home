import { businessDate } from "../lib/businessDate.js";
import { addDays, LEASE_REMINDER_OFFSETS } from "../modules/leases/rules.js";
import { findActiveLeasesEndingOn, listEnabledReminderConfigs } from "../modules/leases/repository.js";
import { sendNotification } from "../modules/notifications/service.js";

const OFFSET_FLAG = {
  30: "remindAt30Days",
  15: "remindAt15Days",
  7: "remindAt7Days",
} as const;

// US-LEASE-05 — runs daily (see jobs/index.ts). For each property with at
// least one reminder offset enabled, finds Active leases whose endDate is
// exactly `offset` days out and pushes a notification to the landlord and
// (if their account exists) the tenant. `dedupeKey` keeps this idempotent
// if the job is re-run or overlaps a retry on the same day.
export async function sendLeaseExpirationReminders(): Promise<void> {
  const today = businessDate();
  const configs = await listEnabledReminderConfigs();

  for (const cfg of configs) {
    for (const offsetDays of LEASE_REMINDER_OFFSETS) {
      const flag = OFFSET_FLAG[offsetDays];
      if (!cfg[flag]) continue;

      const targetDate = addDays(today, offsetDays);
      const endingLeases = await findActiveLeasesEndingOn(cfg.propertyId, targetDate);

      for (const lease of endingLeases) {
        const dayWord = "days";

        await sendNotification({
          userId: lease.landlordId,
          type: "lease.expiring",
          title: "Lease expiring soon",
          body: `The lease for ${lease.roomName} ends on ${targetDate} (${offsetDays} ${dayWord} from now).`,
          linkRef: `lease:${lease.leaseId}`,
          dedupeKey: `lease.expiring:${lease.leaseId}:${offsetDays}:landlord`,
        });

        if (lease.tenantUserId) {
          await sendNotification({
            userId: lease.tenantUserId,
            type: "lease.expiring",
            title: "Your lease is expiring soon",
            body: `Your lease for ${lease.roomName} ends on ${targetDate} (${offsetDays} ${dayWord} from now).`,
            linkRef: `lease:${lease.leaseId}`,
            dedupeKey: `lease.expiring:${lease.leaseId}:${offsetDays}:tenant`,
          });
        }
      }
    }
  }
}

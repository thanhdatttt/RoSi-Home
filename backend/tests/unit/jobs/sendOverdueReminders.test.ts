import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendOverdueReminders } from "../../../src/jobs/sendOverdueReminders.js";
import { db } from "../../../src/db/index.js";
import { sendNotification } from "../../../src/modules/notifications/service.js";

vi.mock("../../../src/db/index.js", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        innerJoin: vi.fn().mockReturnThis(),
<<<<<<< HEAD
        leftJoin: vi.fn().mockReturnThis(),
=======
>>>>>>> origin/main
        where: vi.fn().mockResolvedValue([
          {
            id: "inv-1",
            totalAmount: 1000000,
            billingPeriod: "2025-01",
            dueDate: "2025-01-05",
            tenantUserId: "tenant-1",
<<<<<<< HEAD
            propertyName: "House 1",
            reminderEveryDays: 1,
=======
            propertyName: "House 1"
>>>>>>> origin/main
          }
        ])
      }))
    }))
  }
}));

vi.mock("../../../src/modules/notifications/service.js", () => ({
  sendNotification: vi.fn().mockResolvedValue(undefined)
}));

describe("sendOverdueReminders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queries overdue invoices and sends notifications", async () => {
    await sendOverdueReminders();
    expect(sendNotification).toHaveBeenCalledTimes(1);
    expect(sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "tenant-1",
        type: "payment.overdue",
        linkRef: "invoices/inv-1"
      })
    );
  });
});

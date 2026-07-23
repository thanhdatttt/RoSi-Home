import { UnprocessableError } from "../../lib/errors.js";
import type { MaintenanceStatus } from "./schema.js";

const allowedTransitions: Readonly<
  Record<MaintenanceStatus, readonly MaintenanceStatus[]>
> = {
  Pending: ["InProgress", "Completed"],
  InProgress: ["Completed"],
  Completed: [],
};

export function assertMaintenanceStatusTransition(
  fromStatus: MaintenanceStatus,
  toStatus: MaintenanceStatus,
): void {
  if (fromStatus === toStatus) {
    throw new UnprocessableError(
      `Maintenance request is already ${toStatus}.`,
      [{ field: "status", message: "Must differ from the current status." }],
    );
  }

  if (!allowedTransitions[fromStatus].includes(toStatus)) {
    throw new UnprocessableError(
      `Maintenance status cannot transition from ${fromStatus} to ${toStatus}.`,
      [{ field: "status", message: `Cannot transition from ${fromStatus}.` }],
    );
  }
}

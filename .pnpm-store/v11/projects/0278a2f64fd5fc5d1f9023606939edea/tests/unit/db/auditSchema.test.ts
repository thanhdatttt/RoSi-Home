import { describe, expect, it } from "vitest";
import { auditEvents } from "../../../src/db/schema.js";

describe("auditEvents schema", () => {
  it("stores before and after snapshots as JSONB", () => {
    expect(auditEvents.beforeValue.dataType).toBe("json");
    expect(auditEvents.afterValue.dataType).toBe("json");
  });
});

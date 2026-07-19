import { describe, expect, it } from "vitest";
import { getTableConfig } from "drizzle-orm/pg-core";
import { surcharges } from "../../../src/db/schema.js";

describe("surcharge database index intent", () => {
  it("uses a non-unique active-name lookup index", () => {
    const config = getTableConfig(surcharges);
    const index = config.indexes.find(
      (candidate) => candidate.config.name === "surcharges_name_active",
    );

    expect(index).toBeDefined();
    expect(index?.config.unique).toBe(false);
  });
});

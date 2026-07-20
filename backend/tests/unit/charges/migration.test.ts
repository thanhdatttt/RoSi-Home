import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

type MigrationJournal = {
  entries: Array<{ idx: number; tag: string }>;
};

async function migration(name: string): Promise<string> {
  return readFile(
    new URL(`../../../src/db/migrations/${name}`, import.meta.url),
    "utf8",
  );
}

async function journal(): Promise<MigrationJournal> {
  const content = await migration("meta/_journal.json");
  return JSON.parse(content) as MigrationJournal;
}

describe("Billing Foundation migration", () => {
  it("establishes a non-unique partial lookup index on surcharges", async () => {
    const metadata = await journal();
    const baselineEntry = metadata.entries.find((entry) => entry.idx === 0);

    expect(baselineEntry?.tag).toBe("0000_polite_the_hand");
    const baseline = await migration(`${baselineEntry!.tag}.sql`);

    expect(baseline).toContain(
      'CREATE INDEX IF NOT EXISTS "surcharges_name_active"',
    );
    expect(baseline).not.toContain(
      'CREATE UNIQUE INDEX IF NOT EXISTS "surcharges_name_active"',
    );
    expect(baseline).toContain('"deleted_at" IS NULL');
    expect(baseline).toContain('"active" = true');
  });

  it("stores audit snapshots as JSONB", async () => {
    const metadata = await journal();
    const baselineEntry = metadata.entries.find((entry) => entry.idx === 0);
    const baseline = await migration(`${baselineEntry!.tag}.sql`);

    expect(baseline).toContain('"before_value" jsonb');
    expect(baseline).toContain('"after_value" jsonb');
  });
});

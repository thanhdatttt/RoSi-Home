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

describe("Billing Foundation migration chain", () => {
  it("captures the former unique surcharge index in the baseline", async () => {
    const metadata = await journal();
    const baselineEntry = metadata.entries.find((entry) => entry.idx === 0);

    expect(baselineEntry?.tag).toBe("0000_loose_nehzno");
    const baseline = await migration(`${baselineEntry!.tag}.sql`);

    expect(baseline).toContain(
      'CREATE UNIQUE INDEX IF NOT EXISTS "surcharges_name_active"',
    );
  });

  it("replaces that index with a non-unique partial lookup index", async () => {
    const metadata = await journal();
    const changes = await Promise.all(
      metadata.entries
        .filter((entry) => entry.idx > 0)
        .map((entry) => migration(`${entry.tag}.sql`)),
    );
    const change = changes.join("\n");

    expect(change).toContain(
      'DROP INDEX IF EXISTS "surcharges_name_active"',
    );
    expect(change).toContain(
      'CREATE INDEX IF NOT EXISTS "surcharges_name_active"',
    );
    expect(change).not.toContain(
      'CREATE UNIQUE INDEX IF NOT EXISTS "surcharges_name_active"',
    );
    expect(change).toContain('"deleted_at" IS NULL');
    expect(change).toContain('"active" = true');
  });

  it("migrates existing audit JSON strings to JSONB with an explicit cast", async () => {
    const metadata = await journal();
    const changes = await Promise.all(
      metadata.entries
        .filter((entry) => entry.idx > 0)
        .map((entry) => migration(`${entry.tag}.sql`)),
    );
    const change = changes.join("\n");

    expect(change).toContain(
      'SET DATA TYPE jsonb USING "before_value"::jsonb',
    );
    expect(change).toContain(
      'SET DATA TYPE jsonb USING "after_value"::jsonb',
    );
  });
});

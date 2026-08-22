import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const workspaceDirectory = resolve(scriptDirectory, "..");
const evidenceDirectory = resolve(workspaceDirectory, "evidence");
const npmCliPath = process.env.npm_execpath;
const ansiPattern = /[\u001B\u009B][[\]()#;?]*(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d/#&.:=?%@~_]+)*)?\u0007|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g;

if (!npmCliPath) {
  throw new Error("npm_execpath is unavailable. Run this verifier through `npm run verify:evidence`.");
}

const checks = [
  {
    id: "tests",
    title: "Automated API and hard-problem tests",
    args: ["test"],
  },
  {
    id: "typecheck",
    title: "Strict TypeScript checks",
    args: ["run", "typecheck"],
  },
  {
    id: "build",
    title: "API build and Expo Web export",
    args: ["run", "build"],
  },
  {
    id: "audit-high",
    title: "Production dependency audit (high or critical)",
    args: ["audit", "--omit=dev", "--audit-level=high"],
  },
];

function tail(text, lineCount = 12) {
  return text
    .replace(ansiPattern, "")
    .trim()
    .split(/\r?\n/)
    .slice(-lineCount)
    .join("\n");
}

const startedAt = new Date();
const results = checks.map((check) => {
  const checkStartedAt = Date.now();
  const result = spawnSync(process.execPath, [npmCliPath, ...check.args], {
    cwd: workspaceDirectory,
    encoding: "utf8",
    shell: false,
  });
  const output = [result.stdout, result.stderr, result.error?.message].filter(Boolean).join("\n");

  return {
    id: check.id,
    title: check.title,
    command: `npm ${check.args.join(" ")}`,
    passed: result.status === 0,
    exitCode: result.status ?? 1,
    durationMs: Date.now() - checkStartedAt,
    outputTail: tail(output),
  };
});

const completedAt = new Date();
const passed = results.every((result) => result.passed);
const report = {
  schemaVersion: 1,
  workspace: "poc-local",
  startedAt: startedAt.toISOString(),
  completedAt: completedAt.toISOString(),
  passed,
  checks: results,
  boundaries: [
    "No deployed backend, Supabase, payment gateway, or banking API is required.",
    "Expo Web does not prove native app-store packaging.",
    "PGlite does not prove production PostgreSQL operations or concurrency.",
    "VietQR structural validity does not prove that money moved or payment was verified.",
  ],
};

mkdirSync(evidenceDirectory, { recursive: true });
writeFileSync(
  resolve(evidenceDirectory, "verification-latest.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);

const tableRows = results
  .map(
    (result) =>
      `| ${result.title} | \`${result.command}\` | ${result.passed ? "PASS" : "FAIL"} | ${(
        result.durationMs / 1000
      ).toFixed(1)} s |`,
  )
  .join("\n");
const detailSections = results
  .map(
    (result) =>
      `### ${result.title}\n\n\`\`\`text\n${result.outputTail || "No output captured."}\n\`\`\``,
  )
  .join("\n\n");
const markdown = `# Latest local PoC verification\n\n` +
  `- Started: \`${report.startedAt}\`\n` +
  `- Completed: \`${report.completedAt}\`\n` +
  `- Overall result: **${passed ? "PASS" : "FAIL"}**\n\n` +
  `| Check | Command | Result | Duration |\n` +
  `| --- | --- | --- | ---: |\n` +
  `${tableRows}\n\n` +
  `${detailSections}\n\n` +
  `## Evidence boundaries\n\n` +
  report.boundaries.map((boundary) => `- ${boundary}`).join("\n") +
  `\n`;

writeFileSync(resolve(evidenceDirectory, "verification-latest.md"), markdown, "utf8");

console.log(`Evidence report: ${resolve(evidenceDirectory, "verification-latest.md")}`);
console.log(`Overall result: ${passed ? "PASS" : "FAIL"}`);
process.exitCode = passed ? 0 : 1;

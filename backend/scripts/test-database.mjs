import { spawnSync } from "node:child_process";

const CONTAINER_NAME = "rosihome-test-postgres";
const IMAGE = "postgres:16-alpine";
const DB_USER = "rosihome_test";
const DB_PASSWORD = "rosihome_test";
const DB_NAME = "rosihome_test";
const DB_PORT = "55432";
const OWNERSHIP_LABEL = "com.rosihome.test-database=true";
const TEST_DATABASE_URL =
  `postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:${DB_PORT}/${DB_NAME}`;

function docker(args, options = {}) {
  return spawnSync("docker", args, {
    encoding: "utf8",
    ...options,
  });
}

function assertCommand(result, description) {
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "unknown error").trim();
    throw new Error(`${description}: ${detail}`);
  }
  return result;
}

function inspectContainer() {
  const result = docker([
    "inspect",
    "--format",
    "{{.State.Running}}|{{index .Config.Labels \"com.rosihome.test-database\"}}",
    CONTAINER_NAME,
  ]);
  if (result.status !== 0) return null;
  const [running, owned] = result.stdout.trim().split("|");
  return { running: running === "true", owned: owned === "true" };
}

async function waitUntilReady() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const result = docker(
      ["exec", CONTAINER_NAME, "pg_isready", "-U", DB_USER, "-d", DB_NAME],
      { stdio: "ignore" },
    );
    if (result.status === 0) return;
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error("PostgreSQL test container was not ready within 30 seconds.");
}

async function up() {
  const existing = inspectContainer();
  if (existing && !existing.owned) {
    throw new Error(
      `Container ${CONTAINER_NAME} exists but is not owned by this test runner.`,
    );
  }

  if (!existing) {
    assertCommand(
      docker(
        [
          "run",
          "-d",
          "--name",
          CONTAINER_NAME,
          "--label",
          OWNERSHIP_LABEL,
          "-e",
          `POSTGRES_USER=${DB_USER}`,
          "-e",
          `POSTGRES_PASSWORD=${DB_PASSWORD}`,
          "-e",
          `POSTGRES_DB=${DB_NAME}`,
          "-p",
          `127.0.0.1:${DB_PORT}:5432`,
          IMAGE,
        ],
        { stdio: "inherit" },
      ),
      "Unable to start the PostgreSQL test container",
    );
  } else if (!existing.running) {
    assertCommand(
      docker(["start", CONTAINER_NAME], { stdio: "inherit" }),
      "Unable to start the existing PostgreSQL test container",
    );
  }

  await waitUntilReady();
  console.log(`PostgreSQL test database is ready at ${TEST_DATABASE_URL}`);
}

function down() {
  const existing = inspectContainer();
  if (!existing) {
    console.log("PostgreSQL test container is already absent.");
    return;
  }
  if (!existing.owned) {
    throw new Error(
      `Refusing to remove container ${CONTAINER_NAME}: ownership label is missing.`,
    );
  }
  assertCommand(
    docker(["rm", "-f", CONTAINER_NAME], { stdio: "inherit" }),
    "Unable to remove the PostgreSQL test container",
  );
}

function runIntegrationTests() {
  const npmCli = process.env.npm_execpath;
  if (!npmCli) {
    throw new Error(
      "npm_execpath is unavailable; run this command through an npm script.",
    );
  }
  return spawnSync(process.execPath, [npmCli, "run", "test:integration"], {
    cwd: process.cwd(),
    env: { ...process.env, TEST_DATABASE_URL },
    stdio: "inherit",
  });
}

const command = process.argv[2];

try {
  if (command === "up") {
    await up();
  } else if (command === "down") {
    down();
  } else if (command === "run") {
    await up();
    let result;
    try {
      result = runIntegrationTests();
    } finally {
      down();
    }
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  } else {
    throw new Error("Usage: node scripts/test-database.mjs <up|down|run>");
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}

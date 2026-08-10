// Postgres error code helpers used to map DB-level constraint violations
// (caught as a second line of defense) into domain HTTP errors.

type PgLikeError = { code?: string };

export function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as PgLikeError).code === "23505"
  );
}

import { sql, eq, and, isNull } from "drizzle-orm";
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey(),
  deletedAt: timestamp("deleted_at"),
});

const leases = pgTable("leases", {
  roomId: uuid("room_id"),
  status: text("status"),
  deletedAt: timestamp("deleted_at"),
});

const roomStatusExpr = sql`
  CASE
    WHEN EXISTS (
      SELECT 1 FROM ${leases} l
      WHERE l.room_id = ${rooms.id}
        AND l.status = 'Active'
        AND l.deleted_at IS NULL
    ) THEN 'Occupied'::text
    ELSE 'Vacant'::text
  END`;

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const db = drizzle(new Pool());
const query = db.select({ status: roomStatusExpr }).from(rooms).where(and(eq(rooms.id, '123'), isNull(rooms.deletedAt)));
console.log(query.toSQL());

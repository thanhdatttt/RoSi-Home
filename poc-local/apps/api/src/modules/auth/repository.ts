import { eq } from "drizzle-orm";
import type { AppDrizzle } from "../../db/client.js";
import { users } from "../../db/schema.js";

export class AuthRepository {
  constructor(private readonly db: AppDrizzle) {}

  async findByEmail(email: string) {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return rows[0] ?? null;
  }
}

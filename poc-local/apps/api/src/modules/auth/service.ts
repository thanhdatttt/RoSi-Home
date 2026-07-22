import jwt from "jsonwebtoken";
import { HttpError } from "../../lib/errors.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import type { LoginInput } from "./schema.js";
import type { AuthRepository } from "./repository.js";

const dummyPassword = hashPassword("not-a-real-account-password");

export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly jwtSecret: string,
  ) {}

  async login(input: LoginInput) {
    const user = await this.repository.findByEmail(input.email);
    const passwordMatches = verifyPassword(
      input.password,
      user?.passwordHash ?? dummyPassword.hash,
      user?.passwordSalt ?? dummyPassword.salt,
    );

    if (!user || !passwordMatches) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Email or password is invalid");
    }

    const token = jwt.sign(
      { role: "Landlord" },
      this.jwtSecret,
      { expiresIn: "2h", subject: user.id },
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: "Landlord" as const,
      },
    };
  }
}

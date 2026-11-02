import jwt from "jsonwebtoken";
import { env } from "./env";

const JWT_SECRET = process.env.JWT_SECRET || env.AUTH_SECRET || "topup_center_jwt_secret_change_in_production_2026";
const JWT_EXPIRES_IN = "30d";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name?: string | null;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}


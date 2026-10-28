import { createHash, randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "../generated/prisma/client.js";
import { getConfig } from "../config.js";

export interface AccessClaims {
  sub: string;
  email: string;
  role: Role;
}

function secretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(claims: AccessClaims): Promise<string> {
  const config = getConfig();
  return new SignJWT({ email: claims.email, role: claims.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(config.jwtAccessTtl)
    .sign(secretKey(config.jwtAccessSecret));
}

export async function verifyAccessToken(token: string): Promise<AccessClaims> {
  const config = getConfig();
  const { payload } = await jwtVerify(token, secretKey(config.jwtAccessSecret));
  if (
    !payload.sub ||
    typeof payload.email !== "string" ||
    typeof payload.role !== "string"
  ) {
    throw new Error("Invalid access token payload");
  }
  return {
    sub: payload.sub,
    email: payload.email,
    role: payload.role as Role,
  };
}

export function createRefreshTokenValue(): string {
  return randomBytes(48).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

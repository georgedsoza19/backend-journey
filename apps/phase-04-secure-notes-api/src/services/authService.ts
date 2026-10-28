import bcrypt from "bcryptjs";
import { Role } from "../generated/prisma/client.js";
import {
  ConflictError,
  UnauthorizedError,
} from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import {
  createRefreshTokenValue,
  hashToken,
  refreshExpiryDate,
  signAccessToken,
} from "../lib/tokens.js";

function publicUser(user: {
  id: string;
  email: string;
  name: string;
  role: Role;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

async function issueTokens(user: {
  id: string;
  email: string;
  name: string;
  role: Role;
}) {
  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = createRefreshTokenValue();
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: refreshExpiryDate(),
    },
  });
  return {
    user: publicUser(user),
    accessToken,
    refreshToken,
  };
}

export async function register(input: {
  email: string;
  name: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (existing) {
    throw new ConflictError("Email already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash,
      role: Role.USER,
    },
  });

  return issueTokens(user);
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new UnauthorizedError("Invalid email or password");
  }

  return issueTokens(user);
}

export async function refresh(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!stored || stored.expiresAt.getTime() < Date.now()) {
    if (stored) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
    }
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  // Rotate refresh token
  await prisma.refreshToken.delete({ where: { id: stored.id } });
  return issueTokens(stored.user);
}

export async function logout(refreshToken: string): Promise<void> {
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.deleteMany({ where: { tokenHash } });
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new UnauthorizedError();
  }
  return publicUser(user);
}

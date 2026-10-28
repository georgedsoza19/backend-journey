import bcrypt from "bcryptjs";
import { Role } from "../generated/prisma/client.js";
import { ConflictError, UnauthorizedError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { signAccessToken } from "../lib/tokens.js";

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

async function issue(user: {
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
  return { user: publicUser(user), accessToken };
}

export async function register(input: {
  email: string;
  name: string;
  password: string;
}) {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ConflictError("Email already registered");

  const user = await prisma.user.create({
    data: {
      email,
      name: input.name,
      passwordHash: await bcrypt.hash(input.password, 10),
      role: Role.USER,
    },
  });
  return issue(user);
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (!user) throw new UnauthorizedError("Invalid email or password");

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw new UnauthorizedError("Invalid email or password");

  return issue(user);
}

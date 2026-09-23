import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const SESSION_COOKIE = "sm_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const raw = randomBytes(32).toString("hex");
  const token = hashToken(raw);
  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
  return raw;
}

export const getSession = cache(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const session = await prisma.session.findUnique({
    where: { token: hashToken(raw) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session;
});

export async function requireUser() {
  const session = await getSession();
  if (!session || !session.user.active) redirect("/login");
  return session.user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  const cookieStoreDelete = cookieStore.delete(SESSION_COOKIE);
  if (raw) {
    await prisma.session.deleteMany({ where: { token: hashToken(raw) } });
  }
  return cookieStoreDelete;
}

export type AuthUser = Awaited<ReturnType<typeof requireUser>>;

export function isRole(user: { role: Role }, ...roles: Role[]) {
  return roles.includes(user.role);
}
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "sm_session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = pathname === "/login" || pathname === "/register";

  const raw = request.cookies.get(SESSION_COOKIE)?.value;

  if (!raw) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const token = createHash("sha256").update(raw).digest("hex");
  let valid = false;
  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
    valid = !!session && session.expiresAt > new Date() && session.user.active;
  } catch {
    valid = false;
  }

  if (isPublic) {
    if (valid) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (valid) return NextResponse.next();
  const res = NextResponse.redirect(new URL("/login", request.url));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
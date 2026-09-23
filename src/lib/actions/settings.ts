"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireUser, isRole } from "@/lib/auth";
import { parseOptionalString } from "@/lib/utils";
import type { ActionResult } from "@/lib/actions/types";

export async function updateSettings(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireUser();
  const storeName = String(formData.get("storeName") ?? "").trim();
  if (storeName.length < 2) return { error: "Store name is required." };

  const data = {
    storeName,
    storePhone: parseOptionalString(formData.get("storePhone")),
    storeAddress: parseOptionalString(formData.get("storeAddress")),
    currencySymbol: String(formData.get("currencySymbol") ?? "৳").trim() || "৳",
    taxRate: Number(formData.get("taxRate") ?? 0) || 0,
    lowStockThreshold: Number(formData.get("lowStockThreshold") ?? 5) || 0,
  };

  await prisma.settings.upsert({
    where: { id: 1 },
    update: data,
    create: data,
  });
  revalidatePath("/settings");
  redirect("/settings");
}

export async function createUser(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const me = await requireUser();
  if (!isRole(me, Role.OWNER)) return { error: "Only the owner can manage users." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = (String(formData.get("role") ?? "STAFF") || "STAFF") as Role;
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) return { error: "Name is required." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "A valid email is required." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  if (role !== Role.OWNER && role !== Role.STAFF) return { error: "Invalid role." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "A user with this email already exists." };

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    await prisma.user.create({
      data: {
        name,
        email,
        phone: parseOptionalString(formData.get("phone")),
        role,
        passwordHash,
        active: formData.get("active") === "on",
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "A user with this email already exists." };
    }
    throw e;
  }
  revalidatePath("/settings");
  return {};
}

export async function toggleUserActive(id: string): Promise<ActionResult> {
  const me = await requireUser();
  if (!isRole(me, Role.OWNER)) return { error: "Only the owner can manage users." };
  if (id === me.id) return { error: "You cannot deactivate your own account." };

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { error: "User not found." };

  await prisma.user.update({ where: { id }, data: { active: !user.active } });
  await prisma.session.deleteMany({ where: { userId: id } });
  revalidatePath("/settings");
  return {};
}

export async function resetUserPassword(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const me = await requireUser();
  if (!isRole(me, Role.OWNER)) return { error: "Only the owner can manage users." };

  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!id) return { error: "Missing user." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  revalidatePath("/settings");
  return {};
}
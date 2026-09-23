"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { parseNumber, parseOptionalString, parseDate } from "@/lib/utils";
import type { ActionResult } from "@/lib/actions/types";

export async function createExpenseCategory(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Category name is required." };
  try {
    await prisma.expenseCategory.create({ data: { name } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "A category with this name already exists." };
    }
    throw e;
  }
  revalidatePath("/expenses");
  return {};
}

export async function deleteExpenseCategory(id: string): Promise<ActionResult> {
  await requireUser();
  try {
    await prisma.expenseCategory.delete({ where: { id } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return { error: "Cannot delete: expenses reference this category." };
    }
    throw e;
  }
  revalidatePath("/expenses");
  return {};
}

export async function createExpense(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const categoryId = String(formData.get("categoryId") ?? "");
  const amount = parseNumber(formData.get("amount"));
  if (!categoryId) return { error: "Select an expense category." };
  if (amount <= 0) return { error: "Amount must be greater than zero." };

  await prisma.expense.create({
    data: {
      categoryId,
      amount,
      note: parseOptionalString(formData.get("note")),
      expenseDate: parseDate(formData.get("expenseDate")) ?? new Date(),
      userId: user.id,
    },
  });
  revalidatePath("/expenses");
  revalidatePath("/reports");
  revalidatePath("/");
  redirect("/expenses");
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  await requireUser();
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/expenses");
  revalidatePath("/reports");
  revalidatePath("/");
  return {};
}
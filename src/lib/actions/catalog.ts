"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { parseNumber, parseOptionalString, parseDate } from "@/lib/utils";
import type { ActionResult } from "@/lib/actions/types";

async function authed() {
  return requireUser();
}

export async function createProduct(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await authed();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Product name is required." };

  const sellPrice = parseNumber(formData.get("sellPrice"));
  const costPrice = parseNumber(formData.get("costPrice"));
  if (sellPrice < 0 || costPrice < 0) return { error: "Prices cannot be negative." };

  const data = {
    name,
    categoryId: parseOptionalString(formData.get("categoryId")),
    unit: String(formData.get("unit") ?? "pcs").trim() || "pcs",
    barcode: parseOptionalString(formData.get("barcode")),
    costPrice,
    sellPrice,
    stockQuantity: parseNumber(formData.get("stockQuantity")),
    lowStockThreshold: parseNumber(formData.get("lowStockThreshold")),
    expiryDate: parseDate(formData.get("expiryDate")),
    active: formData.get("active") === "on",
  };

  try {
    await prisma.product.create({ data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "A product with this barcode already exists." };
    }
    throw e;
  }
  revalidatePath("/products");
  redirect("/products");
}

export async function updateProduct(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await authed();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing product id." };

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Product name is required." };

  const sellPrice = parseNumber(formData.get("sellPrice"));
  const costPrice = parseNumber(formData.get("costPrice"));
  if (sellPrice < 0 || costPrice < 0) return { error: "Prices cannot be negative." };

  const data = {
    name,
    categoryId: parseOptionalString(formData.get("categoryId")),
    unit: String(formData.get("unit") ?? "pcs").trim() || "pcs",
    barcode: parseOptionalString(formData.get("barcode")),
    costPrice,
    sellPrice,
    lowStockThreshold: parseNumber(formData.get("lowStockThreshold")),
    expiryDate: parseDate(formData.get("expiryDate")),
    active: formData.get("active") === "on",
  };

  try {
    await prisma.product.update({ where: { id }, data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "A product with this barcode already exists." };
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return { error: "Product not found." };
    }
    throw e;
  }
  revalidatePath("/products");
  redirect("/products");
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await authed();
  try {
    await prisma.product.delete({ where: { id } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return { error: "Cannot delete: this product is used in existing sales or purchases." };
    }
    throw e;
  }
  revalidatePath("/products");
  return {};
}

export async function createCategory(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await authed();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Category name is required." };

  const parentId = parseOptionalString(formData.get("parentId"));

  try {
    await prisma.category.create({ data: { name, parentId } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "A category with this name already exists." };
    }
    throw e;
  }
  revalidatePath("/categories");
  redirect("/categories");
}

export async function updateCategory(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await authed();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || name.length < 2) return { error: "Invalid category." };

  const parentId = parseOptionalString(formData.get("parentId"));
  if (parentId === id) return { error: "A category cannot be its own parent." };

  try {
    await prisma.category.update({ where: { id }, data: { name, parentId } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "A category with this name already exists." };
    }
    throw e;
  }
  revalidatePath("/categories");
  redirect("/categories");
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await authed();
  try {
    await prisma.category.delete({ where: { id } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return { error: "Cannot delete: products reference this category." };
    }
    throw e;
  }
  revalidatePath("/categories");
  return {};
}
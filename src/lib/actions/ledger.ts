"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma, LedgerType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { parseNumber, parseOptionalString } from "@/lib/utils";
import type { ActionResult } from "@/lib/actions/types";

type CustomerData = {
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  creditLimit: number;
  openingBalance: number;
};

function parseCustomer(formData: FormData): CustomerData | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Customer name is required." };
  return {
    name,
    phone: parseOptionalString(formData.get("phone")),
    email: parseOptionalString(formData.get("email")),
    address: parseOptionalString(formData.get("address")),
    creditLimit: parseNumber(formData.get("creditLimit")),
    openingBalance: parseNumber(formData.get("openingBalance")),
  };
}

export async function createCustomer(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireUser();
  const data = parseCustomer(formData);
  if ("error" in data) return data;

  await prisma.customer.create({ data });
  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomer(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing customer id." };
  const data = parseCustomer(formData);
  if ("error" in data) return data;

  await prisma.customer.update({ where: { id }, data });

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}`);
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  await requireUser();
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
  return {};
}

export async function recordCustomerPayment(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireUser();
  const customerId = String(formData.get("customerId") ?? "");
  const amount = parseNumber(formData.get("amount"));
  if (!customerId) return { error: "Missing customer." };
  if (amount <= 0) return { error: "Payment amount must be positive." };
  const note = parseOptionalString(formData.get("note"));

  await prisma.$transaction(async (tx) => {
    const balance = await customerBalance(tx, customerId);
    const newBalance = balance - amount;
    await tx.customerTransaction.create({
      data: {
        customerId,
        type: LedgerType.CREDIT,
        amount,
        balanceAfter: newBalance,
        note: note ?? "Payment received",
      },
    });
  });

  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/customers");
  return {};
}

async function customerBalance(tx: Prisma.TransactionClient, customerId: string) {
  const customer = await tx.customer.findUnique({ where: { id: customerId } });
  if (!customer) return 0;
  const txs = await tx.customerTransaction.findMany({ where: { customerId } });
  const sum = txs.reduce(
    (acc, t) => acc + (t.type === LedgerType.DEBIT ? t.amount : -t.amount),
    customer.openingBalance
  );
  return sum;
}

type SupplierData = {
  company: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
};

function parseSupplier(formData: FormData): SupplierData | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Supplier name is required." };
  return {
    company: parseOptionalString(formData.get("company")),
    name,
    phone: parseOptionalString(formData.get("phone")),
    email: parseOptionalString(formData.get("email")),
    address: parseOptionalString(formData.get("address")),
  };
}

export async function createSupplier(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireUser();
  const data = parseSupplier(formData);
  if ("error" in data) return data;
  await prisma.supplier.create({ data });
  revalidatePath("/suppliers");
  redirect("/suppliers");
}

export async function updateSupplier(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing supplier id." };
  const data = parseSupplier(formData);
  if ("error" in data) return data;
  await prisma.supplier.update({ where: { id }, data });
  revalidatePath("/suppliers");
  revalidatePath(`/suppliers/${id}`);
  redirect(`/suppliers/${id}`);
}

export async function deleteSupplier(id: string): Promise<ActionResult> {
  await requireUser();
  await prisma.supplier.delete({ where: { id } });
  revalidatePath("/suppliers");
  return {};
}

export async function recordSupplierPayment(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireUser();
  const supplierId = String(formData.get("supplierId") ?? "");
  const amount = parseNumber(formData.get("amount"));
  if (!supplierId) return { error: "Missing supplier." };
  if (amount <= 0) return { error: "Payment amount must be positive." };
  const note = parseOptionalString(formData.get("note"));

  await prisma.$transaction(async (tx) => {
    const balance = await supplierBalance(tx, supplierId);
    const newBalance = balance - amount;
    await tx.supplierTransaction.create({
      data: {
        supplierId,
        type: LedgerType.DEBIT,
        amount,
        balanceAfter: newBalance,
        note: note ?? "Payment made",
      },
    });
  });

  revalidatePath(`/suppliers/${supplierId}`);
  revalidatePath("/suppliers");
  return {};
}

async function supplierBalance(tx: Prisma.TransactionClient, supplierId: string) {
  const supplier = await tx.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) return 0;
  const txs = await tx.supplierTransaction.findMany({ where: { supplierId } });
  return txs.reduce(
    (acc, t) => acc + (t.type === LedgerType.CREDIT ? t.amount : -t.amount),
    0
  );
}
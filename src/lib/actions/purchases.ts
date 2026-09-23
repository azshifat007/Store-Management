"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma, LedgerType, PaymentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { parseNumber, parseOptionalString, parseDate, nextInvoiceNo } from "@/lib/utils";
import type { ActionResult } from "@/lib/actions/types";

class ValidationError extends Error {}

type Line = { productId: string; qty: number; price: number; expiryDate: Date | null };

function parseLines(formData: FormData): Line[] {
  const lines: Line[] = [];
  for (let i = 0; i < 200; i++) {
    const productId = String(formData.get(`product_${i}`) ?? "");
    const qty = parseNumber(formData.get(`qty_${i}`));
    const price = parseNumber(formData.get(`price_${i}`));
    if (!productId) continue;
    if (qty <= 0) throw new ValidationError(`Line ${i + 1}: quantity must be greater than zero.`);
    lines.push({ productId, qty, price, expiryDate: parseDate(formData.get(`expiry_${i}`)) });
  }
  return lines;
}

async function supplierBalanceTx(tx: Prisma.TransactionClient, supplierId: string) {
  const txs = await tx.supplierTransaction.findMany({ where: { supplierId }, select: { type: true, amount: true } });
  return txs.reduce((acc, t) => acc + (t.type === LedgerType.CREDIT ? t.amount : -t.amount), 0);
}

export async function createPurchase(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();

  let lines: Line[];
  try {
    lines = parseLines(formData);
  } catch (e) {
    if (e instanceof ValidationError) return { error: e.message };
    throw e;
  }
  if (lines.length === 0) return { error: "Add at least one item to the purchase." };

  const supplierId = parseOptionalString(formData.get("supplierId"));
  const paymentType = (String(formData.get("paymentType") ?? "CASH") || "CASH") as PaymentType;
  const discount = parseNumber(formData.get("discount"));
  const otherCharge = parseNumber(formData.get("otherCharge"));
  const paidAmount = parseNumber(formData.get("paidAmount"));
  const note = parseOptionalString(formData.get("note"));
  const purchaseDate = parseDate(formData.get("purchaseDate")) ?? new Date();

  if (discount < 0 || otherCharge < 0 || paidAmount < 0)
    return { error: "Discount, other charge and paid amount cannot be negative." };

  try {
    await prisma.$transaction(async (tx) => {
      for (const line of lines) {
        const product = await tx.product.findUnique({ where: { id: line.productId } });
        if (!product) throw new ValidationError(`A selected product is not available (id ${line.productId}).`);
      }

      const subtotal = lines.reduce((sum, l) => sum + l.qty * l.price, 0);
      const total = subtotal + otherCharge - discount;
      const due = total - paidAmount;
      if (due < 0) throw new ValidationError("Paid amount exceeds purchase total.");
      if (due > 0 && !supplierId)
        throw new ValidationError("Credit purchase requires a supplier.");

      const invoiceNo = await nextInvoiceNo("purchase");

      const created = await tx.purchase.create({
        data: {
          invoiceNo,
          supplierId,
          userId: user.id,
          purchaseDate,
          subtotal,
          discount,
          otherCharge,
          total,
          paidAmount,
          paymentType,
          note,
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              quantity: l.qty,
              unitPrice: l.price,
              total: l.qty * l.price,
              expiryDate: l.expiryDate,
            })),
          },
        },
        include: { items: true },
      });

      for (const line of lines) {
        const product = await tx.product.findUnique({ where: { id: line.productId } });
        const old = product;
        const newQty = (old?.stockQuantity ?? 0) + line.qty;
        const newCost =
          newQty > 0
            ? ((old?.stockQuantity ?? 0) * (old?.costPrice ?? 0) + line.qty * line.price) / newQty
            : line.price;
        await tx.product.update({
          where: { id: line.productId },
          data: { stockQuantity: newQty, costPrice: newCost },
        });
      }

      if (supplierId && due > 0) {
        const balance = await supplierBalanceTx(tx, supplierId);
        await tx.supplierTransaction.create({
          data: {
            supplierId,
            type: LedgerType.CREDIT,
            amount: due,
            balanceAfter: balance + due,
            purchaseId: created.id,
            note: `Invoice ${invoiceNo}`,
          },
        });
      }

      return created;
    });

    revalidatePath("/purchases");
    revalidatePath("/");
    revalidatePath(`/suppliers/${supplierId}`);
    revalidatePath("/reports");
    redirect("/purchases");
  } catch (e) {
    if (e instanceof ValidationError) return { error: e.message };
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Invoice number collision. Please try again." };
    }
    throw e;
  }
}
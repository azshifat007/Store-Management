"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma, LedgerType, PaymentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { parseNumber, parseOptionalString, parseDate, nextInvoiceNo } from "@/lib/utils";
import type { ActionResult } from "@/lib/actions/types";

class ValidationError extends Error {}

type Line = { productId: string; qty: number; price: number };

function parseLines(formData: FormData): Line[] {
  const lines: Line[] = [];
  for (let i = 0; i < 200; i++) {
    const productId = String(formData.get(`product_${i}`) ?? "");
    const qty = parseNumber(formData.get(`qty_${i}`));
    const price = parseNumber(formData.get(`price_${i}`));
    if (!productId) continue;
    if (qty <= 0) throw new ValidationError(`Line ${i + 1}: quantity must be greater than zero.`);
    lines.push({ productId, qty, price });
  }
  return lines;
}

async function customerBalanceTx(tx: Prisma.TransactionClient, customerId: string) {
  const customer = await tx.customer.findUnique({ where: { id: customerId }, select: { openingBalance: true } });
  const txs = await tx.customerTransaction.findMany({ where: { customerId }, select: { type: true, amount: true } });
  return (
    (customer?.openingBalance ?? 0) +
    txs.reduce((acc, t) => acc + (t.type === LedgerType.DEBIT ? t.amount : -t.amount), 0)
  );
}

export async function createSale(
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
  if (lines.length === 0) return { error: "Add at least one item to the sale." };

  const customerId = parseOptionalString(formData.get("customerId"));
  const paymentType = (String(formData.get("paymentType") ?? "CASH") || "CASH") as PaymentType;
  const discount = parseNumber(formData.get("discount"));
  const deliveryCharge = parseNumber(formData.get("deliveryCharge"));
  const paidAmount = parseNumber(formData.get("paidAmount"));
  const note = parseOptionalString(formData.get("note"));
  const saleDate = parseDate(formData.get("saleDate")) ?? new Date();

  if (discount < 0 || deliveryCharge < 0 || paidAmount < 0)
    return { error: "Discount, delivery charge and paid amount cannot be negative." };

  try {
    const sale = await prisma.$transaction(async (tx) => {
      const products = new Map<string, { name: string; unit: string; costPrice: number; stockQuantity: number }>();
      for (const line of lines) {
        const product = await tx.product.findUnique({ where: { id: line.productId } });
        if (!product || !product.active)
          throw new ValidationError("A selected product is not available.");
        if (product.stockQuantity < line.qty)
          throw new ValidationError(
            `Insufficient stock for "${product.name}". Available: ${product.stockQuantity} ${product.unit}.`
          );
        products.set(line.productId, product);
      }

      const subtotal = lines.reduce((sum, l) => sum + l.qty * l.price, 0);
      const total = subtotal + deliveryCharge - discount;
      const due = total - paidAmount;
      if (due < 0) throw new ValidationError("Paid amount exceeds invoice total.");
      if (due > 0 && !customerId)
        throw new ValidationError("Credit sale requires a customer.");

      const invoiceNo = await nextInvoiceNo("sale");

      const created = await tx.sale.create({
        data: {
          invoiceNo,
          customerId,
          userId: user.id,
          saleDate,
          subtotal,
          discount,
          deliveryCharge,
          total,
          paidAmount,
          paymentType,
          note,
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              quantity: l.qty,
              unitPrice: l.price,
              unitCost: products.get(l.productId)?.costPrice ?? 0,
              total: l.qty * l.price,
            })),
          },
        },
        include: { items: true },
      });

      for (const line of lines) {
        await tx.product.update({
          where: { id: line.productId },
          data: { stockQuantity: { decrement: line.qty } },
        });
      }

      if (customerId && due > 0) {
        const balance = await customerBalanceTx(tx, customerId);
        await tx.customerTransaction.create({
          data: {
            customerId,
            type: LedgerType.DEBIT,
            amount: due,
            balanceAfter: balance + due,
            saleId: created.id,
            note: `Invoice ${invoiceNo}`,
          },
        });
      }

      return created;
    });

    revalidatePath("/sales");
    revalidatePath("/");
    revalidatePath(`/customers/${customerId}`);
    revalidatePath("/reports");
    redirect(`/sales?invoice=${sale.invoiceNo}`);
  } catch (e) {
    if (e instanceof ValidationError) return { error: e.message };
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Invoice number collision. Please try again." };
    }
    throw e;
  }
}
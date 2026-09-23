import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getSettings = cache(async () => {
  return (
    (await prisma.settings.findUnique({ where: { id: 1 } })) ?? {
      id: 1,
      storeName: "My Store",
      storePhone: null,
      storeAddress: null,
      currencySymbol: "৳",
      taxRate: 0,
      lowStockThreshold: 5,
    }
  );
});

export async function formatMoney(n: number) {
  const settings = await getSettings();
  return fmtMoney(n, settings.currencySymbol);
}

export function fmtMoney(n: number, symbol: string) {
  const formatted = n.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  return `${symbol}${formatted}`;
}

export function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${formatDate(date)} ${date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export async function nextInvoiceNo(kind: "sale" | "purchase") {
  const model = kind === "sale" ? prisma.sale : prisma.purchase;
  const prefix = kind === "sale" ? "INV" : "PUR";
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefixWithStamp = `${prefix}-${stamp}-`;
  const count = await (model as typeof prisma.sale).count({
    where: { invoiceNo: { startsWith: prefixWithStamp } },
  });
  return `${prefixWithStamp}${String(count + 1).padStart(4, "0")}`;
}

export function parseNumber(value: FormDataEntryValue | null): number {
  if (value === null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function parseOptionalString(value: FormDataEntryValue | null): string | null {
  const s = typeof value === "string" ? value.trim() : "";
  return s === "" ? null : s;
}

export function parseDate(value: FormDataEntryValue | null): Date | null {
  const s = typeof value === "string" ? value.trim() : "";
  if (!s || Number.isNaN(Date.parse(s))) return null;
  return new Date(s);
}
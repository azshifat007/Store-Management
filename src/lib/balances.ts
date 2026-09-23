import { LedgerType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function customerBalance(customerId: string) {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) return 0;
  const txs = await prisma.customerTransaction.findMany({ where: { customerId: customerId } });
  return (
    customer.openingBalance +
    txs.reduce((acc, t) => acc + (t.type === LedgerType.DEBIT ? t.amount : -t.amount), 0)
  );
}

export async function supplierBalance(supplierId: string) {
  const txs = await prisma.supplierTransaction.findMany({ where: { supplierId: supplierId } });
  return txs.reduce((acc, t) => acc + (t.type === LedgerType.CREDIT ? t.amount : -t.amount), 0);
}

export async function allCustomerBalances() {
  const customers = await prisma.customer.findMany({
    include: {
      transactions: { select: { type: true, amount: true } },
    },
    orderBy: { name: "asc" },
  });
  return customers.map((c) => ({
    ...c,
    balance:
      c.openingBalance +
      c.transactions.reduce((acc, t) => acc + (t.type === LedgerType.DEBIT ? t.amount : -t.amount), 0),
  }));
}

export async function allSupplierBalances() {
  const suppliers = await prisma.supplier.findMany({
    include: {
      transactions: { select: { type: true, amount: true } },
    },
    orderBy: { name: "asc" },
  });
  return suppliers.map((s) => ({
    ...s,
    balance: s.transactions.reduce(
      (acc, t) => acc + (t.type === LedgerType.CREDIT ? t.amount : -t.amount),
      0
    ),
  }));
}
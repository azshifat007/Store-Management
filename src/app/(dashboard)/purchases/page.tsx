import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/utils";
import { Card, LinkButton, PageHeader, Stat } from "@/components/ui";
import { PurchasesTable } from "@/components/tables";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  await requireUser();

  const [purchases, monthCount, monthTotal] = await Promise.all([
    prisma.purchase.findMany({
      take: 100,
      orderBy: { purchaseDate: "desc" },
      include: { items: true },
    }),
    prisma.purchase.count({
      where: {
        purchaseDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    prisma.purchase.aggregate({
      where: {
        purchaseDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      _sum: { total: true },
    }),
  ]);

  const dueTotal = purchases.reduce((sum, p) => sum + (p.total - p.paidAmount), 0);

  return (
    <div>
      <PageHeader title="Purchases" description={`${purchases.length} recent purchase invoices`}>
        <LinkButton href="/purchases/new">+ New purchase</LinkButton>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="This month" value={String(monthCount)} />
        <Stat label="This month total" value={await formatMoney(monthTotal._sum.total ?? 0)} accent />
        <Stat label="Outstanding (viewed)" value={await formatMoney(dueTotal)} />
      </div>

      <Card>
        <PurchasesTable purchases={purchases} />
      </Card>
    </div>
  );
}
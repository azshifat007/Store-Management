import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/utils";
import { Alert, Card, LinkButton, PageHeader, Stat } from "@/components/ui";
import { SalesTable } from "@/components/tables";

export const dynamic = "force-dynamic";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ invoice?: string }>;
}) {
  await requireUser();
  const { invoice } = await searchParams;

  const [sales, todayCount, todayTotal] = await Promise.all([
    prisma.sale.findMany({
      take: 100,
      orderBy: { saleDate: "desc" },
      include: { customer: { select: { name: true } } },
    }),
    prisma.sale.count({
      where: { saleDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.sale.aggregate({
      where: { saleDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      _sum: { total: true },
    }),
  ]);

  const dueTotal = sales.reduce((sum, s) => sum + (s.total - s.paidAmount), 0);

  return (
    <div>
      <PageHeader title="Sales" description={`${sales.length} recent invoices`}>
        <LinkButton href="/sales/new">+ New sale</LinkButton>
      </PageHeader>

      {invoice && (
        <Alert tone="green">Invoice {invoice} was created successfully.</Alert>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Today's invoices" value={String(todayCount)} />
        <Stat label="Today's total" value={await formatMoney(todayTotal._sum.total ?? 0)} accent />
        <Stat label="Outstanding (viewed)" value={await formatMoney(dueTotal)} />
      </div>

      <Card>
        <SalesTable sales={sales} />
      </Card>
    </div>
  );
}
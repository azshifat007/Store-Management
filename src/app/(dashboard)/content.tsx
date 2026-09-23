import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getSettings, formatMoney } from "@/lib/utils";
import { allCustomerBalances, allSupplierBalances } from "@/lib/balances";
import { Badge, Card, PageHeader, Stat, Table, TBody, THead, TH, TR, TD } from "@/components/ui";
import { SalesTable } from "@/components/tables";
import Link from "next/link";

export default async function DashboardContent() {
  await requireUser();
  const settings = await getSettings();
  const dayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [todaySales, monthSales, productCount, customers, suppliers, recentSales, lowStock] =
    await Promise.all([
      prisma.sale.aggregate({
        where: { saleDate: { gte: dayStart } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: { saleDate: { gte: monthStart } },
        _sum: { total: true },
      }),
      prisma.product.count({ where: { active: true } }),
      allCustomerBalances(),
      allSupplierBalances(),
      prisma.sale.findMany({
        take: 8,
        orderBy: { saleDate: "desc" },
        include: { customer: { select: { name: true } } },
      }),
      prisma.product.findMany({
        where: { active: true, stockQuantity: { lte: settings.lowStockThreshold } },
        take: 10,
        orderBy: { stockQuantity: "asc" },
        select: { id: true, name: true, stockQuantity: true, lowStockThreshold: true, unit: true },
      }),
    ]);

  const receivable = customers.reduce((sum, c) => sum + Math.max(0, c.balance), 0);
  const payable = suppliers.reduce((sum, s) => sum + Math.max(0, s.balance), 0);

  return (
    <div>
      <PageHeader title="Dashboard" description={`Welcome back. Here's what's happening today.`} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Today's sales" value={await formatMoney(todaySales._sum.total ?? 0)} accent />
        <Stat label="This month" value={await formatMoney(monthSales._sum.total ?? 0)} />
        <Stat label="Receivable" value={await formatMoney(receivable)} />
        <Stat label="Payable" value={await formatMoney(payable)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Recent sales</h2>
            <Link href="/sales" className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400">
              View all
            </Link>
          </div>
          <Card>
            <SalesTable sales={recentSales} />
          </Card>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Low stock ({lowStock.length})</h2>
            <Link href="/products" className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400">
              Products
            </Link>
          </div>
          <Card>
            <Table>
              <THead>
                <TH>Product</TH>
                <TH className="text-right">Stock</TH>
              </THead>
              <TBody>
                {lowStock.length === 0 ? (
                  <TR>
                    <TD colSpan={2} className="py-8 text-center text-zinc-400">
                      All stock levels are healthy.
                    </TD>
                  </TR>
                ) : (
                  lowStock.map((p) => (
                    <TR key={p.id}>
                      <TD className="font-medium text-zinc-900 dark:text-zinc-50">{p.name}</TD>
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-semibold text-red-600">
                            {p.stockQuantity} {p.unit}
                          </span>
                          <Badge tone="red">Low</Badge>
                        </div>
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </Card>

          <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Active products</h2>
            <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{productCount}</p>
            <p className="text-xs text-zinc-400">in your catalog</p>
          </div>
        </div>
      </div>
    </div>
  );
}

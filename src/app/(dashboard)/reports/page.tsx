import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getSettings, formatMoney, fmtMoney } from "@/lib/utils";
import { Card, PageHeader, Stat, Table, TBody, THead, TH, TR, TD, Input, Button } from "@/components/ui";

export const dynamic = "force-dynamic";

function toDate(value: string | undefined, fallback: () => Date): Date {
  if (value && !Number.isNaN(Date.parse(value))) return new Date(value as string);
  return fallback();
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await requireUser();
  const { from, to } = await searchParams;

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const today = new Date();
  const dateFrom = toDate(from, () => monthStart);
  dateFrom.setHours(0, 0, 0, 0);
  const dateTo = toDate(to, () => today);
  dateTo.setHours(23, 59, 59, 999);

  const whereRange = { gte: dateFrom, lte: dateTo };

  const [sales, saleCount, purchases, expenses, expenseByCategory, profitByDay] = await Promise.all([
    prisma.sale.aggregate({
      where: { saleDate: whereRange },
      _sum: { total: true, deliveryCharge: true, discount: true },
    }),
    prisma.sale.count({ where: { saleDate: whereRange } }),
    prisma.purchase.aggregate({
      where: { purchaseDate: whereRange },
      _sum: { total: true },
    }),
    prisma.expense.aggregate({
      where: { expenseDate: whereRange },
      _sum: { amount: true },
    }),
    prisma.expense.groupBy({
      by: ["categoryId"],
      where: { expenseDate: whereRange },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.sale.findMany({
      where: { saleDate: whereRange },
      select: { items: { select: { quantity: true, unitCost: true } } },
    }),
  ]);

  const costOfGoods = profitByDay.reduce(
    (sum, s) => sum + s.items.reduce((a, i) => a + i.quantity * (i.unitCost ?? 0), 0),
    0
  );
  const revenue = sales._sum.total ?? 0;
  const grossProfit = revenue - costOfGoods;
  const expensesTotal = expenses._sum.amount ?? 0;
  const purchaseTotal = purchases._sum.total ?? 0;
  const netProfit = grossProfit - expensesTotal;

  const categories = await prisma.expenseCategory.findMany();
  const symbol = (await getSettings()).currencySymbol;

  const rangeLabel = `${dateFrom.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })} – ${dateTo.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`;

  return (
    <div>
      <PageHeader title="Reports" description={rangeLabel} />

      <form className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-zinc-500">From</span>
          <Input type="date" name="from" defaultValue={dateFrom.toISOString().slice(0, 10)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-zinc-500">To</span>
          <Input type="date" name="to" defaultValue={dateTo.toISOString().slice(0, 10)} />
        </label>
        <Button type="submit" className="mb-0">
          Apply range
        </Button>
      </form>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label={`Sales revenue (${saleCount} invoices)`} value={await formatMoney(revenue)} accent />
        <Stat label="Cost of goods sold" value={await formatMoney(costOfGoods)} />
        <Stat label="Gross profit" value={await formatMoney(grossProfit)} accent={grossProfit >= 0} />
        <Stat label="Purchases" value={await formatMoney(purchaseTotal)} />
        <Stat label="Expenses" value={await formatMoney(expensesTotal)} />
        <Stat label="Net profit" value={await formatMoney(netProfit)} accent={netProfit >= 0} />
      </div>

      <Card>
        <h2 className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
          Expenses by category
        </h2>
        <Table>
          <THead>
            <TH>Category</TH>
            <TH className="text-right">Amount</TH>
          </THead>
          <TBody>
            {expenseByCategory.length === 0 ? (
              <TR>
                <TD colSpan={2} className="py-8 text-center text-zinc-400">
                  No expenses in this range.
                </TD>
              </TR>
            ) : (
              expenseByCategory.map((row) => {
                const name = categories.find((c) => c.id === row.categoryId)?.name ?? "Unknown";
                return (
                  <TR key={row.categoryId}>
                    <TD>{name}</TD>
                    <TD className="text-right font-medium">{fmtMoney(row._sum.amount ?? 0, symbol)}</TD>
                  </TR>
                );
              })
            )}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getSettings, formatDateTime, fmtMoney } from "@/lib/utils";
import {
  createExpenseCategory,
  deleteExpense,
  deleteExpenseCategory,
} from "@/lib/actions/expenses";
import { Card, EmptyState, Input, PageHeader, Table, TBody, THead, TH, TR, TD } from "@/components/ui";
import { DeleteButton, SubmitButton } from "@/components/forms";
import { ExpenseForm } from "@/components/expense-form";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  await requireUser();
  const [categories, expenses, monthTotal] = await Promise.all([
    prisma.expenseCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.expense.findMany({
      take: 100,
      orderBy: { expenseDate: "desc" },
      include: { category: true, user: { select: { name: true } } },
    }),
    prisma.expense.aggregate({
      where: { expenseDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
      _sum: { amount: true },
    }),
  ]);

  const symbol = (await getSettings()).currencySymbol;

  return (
    <div>
      <PageHeader
        title="Expenses"
        description={`This month: ${fmtMoney(monthTotal._sum.amount ?? 0, symbol)}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Add expense</h2>
            <ExpenseForm categories={categories} />
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Categories</h2>
            <form
              action={async (fd: FormData) => {
                "use server";
                await createExpenseCategory({}, fd);
              }}
              className="mb-4 flex gap-2"
            >
              <Input name="name" placeholder="New category name" className="flex-1" required />
              <SubmitButton>Add</SubmitButton>
            </form>
            {categories.length === 0 ? (
              <p className="text-sm text-zinc-400">No categories yet.</p>
            ) : (
              <ul className="space-y-1">
                {categories.map((c) => (
                  <li key={c.id} className="flex items-center justify-between rounded-md px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800">
                    {c.name}
                    <DeleteButton action={deleteExpenseCategory.bind(null, c.id)} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2">
          {expenses.length === 0 ? (
            <EmptyState title="No expenses recorded" description="Record expenses to track business costs." />
          ) : (
            <Card>
              <Table>
                <THead>
                  <TH>Date</TH>
                  <TH>Category</TH>
                  <TH>Note</TH>
                  <TH>By</TH>
                  <TH className="text-right">Amount</TH>
                  <TH className="text-right"></TH>
                </THead>
                <TBody>
                  {expenses.map((e) => (
                    <TR key={e.id}>
                      <TD>{formatDateTime(e.expenseDate)}</TD>
                      <TD className="font-medium text-zinc-900 dark:text-zinc-50">{e.category.name}</TD>
                      <TD>{e.note ?? <span className="text-zinc-400">—</span>}</TD>
                      <TD>{e.user?.name ?? <span className="text-zinc-400">—</span>}</TD>
                      <TD className="text-right font-medium">{fmtMoney(e.amount, symbol)}</TD>
                      <TD className="text-right">
                        <DeleteButton action={deleteExpense.bind(null, e.id)} />
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
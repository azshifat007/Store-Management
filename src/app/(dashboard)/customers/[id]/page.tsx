import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getSettings, formatMoney, formatDateTime, fmtMoney } from "@/lib/utils";
import { customerBalance } from "@/lib/balances";
import { deleteCustomer, recordCustomerPayment } from "@/lib/actions/ledger";
import { Badge, Card, LinkButton, PageHeader, Stat, Table, TBody, THead, TH, TR, TD } from "@/components/ui";
import { DeleteButton } from "@/components/forms";
import { PaymentForm } from "@/components/payment-form";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      transactions: { orderBy: { transactionDate: "desc" }, take: 100 },
      sales: {
        take: 20,
        orderBy: { saleDate: "desc" },
        select: { id: true, invoiceNo: true, saleDate: true, total: true, paidAmount: true, paymentType: true },
      },
    },
  });
  if (!customer) {
    return (
      <div>
        <PageHeader title="Customer not found" />
        <LinkButton href="/customers" variant="outline">Back to customers</LinkButton>
      </div>
    );
  }

  const symbol = (await getSettings()).currencySymbol;
  const balance = await customerBalance(id);
  const totalPurchased = customer.sales.reduce((sum, s) => sum + s.total, 0);
  const totalDue = customer.sales.reduce((sum, s) => sum + (s.total - s.paidAmount), 0);

  return (
    <div>
      <PageHeader
        title={customer.name}
        description={[customer.phone, customer.address].filter(Boolean).join(" · ") || "No contact info"}
      >
        <LinkButton href="/customers" variant="outline">Back</LinkButton>
        <DeleteButton action={deleteCustomer.bind(null, customer.id)} />
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Current balance" value={await formatMoney(balance)} accent={balance > 0} />
        <Stat label="Total sales" value={await formatMoney(totalPurchased)} />
        <Stat label="Outstanding on sales" value={await formatMoney(totalDue)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold">Record payment</h2>
          <p className="mb-4 text-xs text-zinc-500">
            Payments reduce what this customer owes you.
          </p>
          <PaymentForm
            action={recordCustomerPayment}
            partyIdField="customerId"
            partyId={customer.id}
            label="Amount received"
            placeholder="0.00"
          />
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <Table>
              <THead>
                <TH>Date</TH>
                <TH>Type</TH>
                <TH className="text-right">Amount</TH>
                <TH className="text-right">Balance</TH>
                <TH>Note / Reference</TH>
              </THead>
              <TBody>
                {customer.transactions.length === 0 ? (
                  <TR>
                    <TD colSpan={5} className="py-8 text-center text-zinc-400">
                      No transactions yet.
                    </TD>
                  </TR>
                ) : (
                  customer.transactions.map((t) => (
                    <TR key={t.id}>
                      <TD>{formatDateTime(t.transactionDate)}</TD>
                      <TD>
                        <Badge tone={t.type === "DEBIT" ? "amber" : "green"}>
                          {t.type === "DEBIT" ? "Debit" : "Credit"}
                        </Badge>
                      </TD>
                      <TD className="text-right">{fmtMoney(t.amount, symbol)}</TD>
                      <TD className="text-right font-medium">{fmtMoney(t.balanceAfter, symbol)}</TD>
                      <TD>
                        {t.saleId && <Link href={`/sales#${t.saleId}`} className="text-emerald-600 hover:underline dark:text-emerald-400">Sale ref</Link>}
                        {!t.saleId && (t.note ?? <span className="text-zinc-400">—</span>)}
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </Card>

          <h2 className="mb-3 mt-8 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Recent sales</h2>
          <Card>
            <Table>
              <THead>
                <TH>Invoice</TH>
                <TH>Date</TH>
                <TH className="text-right">Total</TH>
                <TH className="text-right">Paid</TH>
                <TH className="text-right">Due</TH>
              </THead>
              <TBody>
                {customer.sales.length === 0 ? (
                  <TR>
                    <TD colSpan={5} className="py-8 text-center text-zinc-400">No sales yet.</TD>
                  </TR>
                ) : (
                  customer.sales.map((s) => (
                    <TR key={s.id}>
                      <TD className="font-mono text-xs">{s.invoiceNo}</TD>
                      <TD>{formatDateTime(s.saleDate)}</TD>
                      <TD className="text-right">{fmtMoney(s.total, symbol)}</TD>
                      <TD className="text-right">{fmtMoney(s.paidAmount, symbol)}</TD>
                      <TD className="text-right">{fmtMoney(s.total - s.paidAmount, symbol)}</TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
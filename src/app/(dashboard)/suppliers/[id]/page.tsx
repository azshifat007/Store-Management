import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getSettings, formatMoney, formatDateTime, fmtMoney } from "@/lib/utils";
import { supplierBalance } from "@/lib/balances";
import { deleteSupplier, recordSupplierPayment } from "@/lib/actions/ledger";
import { Badge, Card, LinkButton, PageHeader, Stat, Table, TBody, THead, TH, TR, TD } from "@/components/ui";
import { DeleteButton } from "@/components/forms";
import { PaymentForm } from "@/components/payment-form";
import { PurchasesTable } from "@/components/tables";

export const dynamic = "force-dynamic";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      transactions: { orderBy: { transactionDate: "desc" }, take: 100 },
    },
  });
  if (!supplier) {
    return (
      <div>
        <PageHeader title="Supplier not found" />
        <LinkButton href="/suppliers" variant="outline">Back to suppliers</LinkButton>
      </div>
    );
  }

  const symbol = (await getSettings()).currencySymbol;
  const balance = await supplierBalance(id);
  const purchases = await prisma.purchase.findMany({
    where: { supplierId: id },
    orderBy: { purchaseDate: "desc" },
    take: 20,
    include: { items: true },
  });
  const totalBought = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalDue = purchases.reduce((sum, p) => sum + (p.total - p.paidAmount), 0);

  return (
    <div>
      <PageHeader
        title={supplier.name}
        description={[supplier.company, supplier.phone, supplier.address].filter(Boolean).join(" · ") || "No contact info"}
      >
        <LinkButton href="/suppliers" variant="outline">Back</LinkButton>
        <DeleteButton action={deleteSupplier.bind(null, supplier.id)} />
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Current payable" value={await formatMoney(balance)} accent={balance > 0} />
        <Stat label="Total purchases" value={await formatMoney(totalBought)} />
        <Stat label="Outstanding on purchases" value={await formatMoney(totalDue)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold">Make payment</h2>
          <p className="mb-4 text-xs text-zinc-500">Payments reduce what you owe this supplier.</p>
          <PaymentForm
            action={recordSupplierPayment}
            partyIdField="supplierId"
            partyId={supplier.id}
            label="Amount paid"
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
                <TH>Note</TH>
              </THead>
              <TBody>
                {supplier.transactions.length === 0 ? (
                  <TR><TD colSpan={5} className="py-8 text-center text-zinc-400">No transactions yet.</TD></TR>
                ) : (
                  supplier.transactions.map((t) => (
                    <TR key={t.id}>
                      <TD>{formatDateTime(t.transactionDate)}</TD>
                      <TD>
                        <Badge tone={t.type === "CREDIT" ? "amber" : "green"}>
                          {t.type === "CREDIT" ? "Credit" : "Debit"}
                        </Badge>
                      </TD>
                      <TD className="text-right">{fmtMoney(t.amount, symbol)}</TD>
                      <TD className="text-right font-medium">{fmtMoney(t.balanceAfter, symbol)}</TD>
                      <TD>{t.note ?? <span className="text-zinc-400">—</span>}</TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </Card>

          <h2 className="mb-3 mt-8 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Recent purchases</h2>
          <PurchasesTable purchases={purchases} />
        </div>
      </div>
    </div>
  );
}
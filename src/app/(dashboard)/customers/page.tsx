import { requireUser } from "@/lib/auth";
import { getSettings, fmtMoney } from "@/lib/utils";
import { allCustomerBalances } from "@/lib/balances";
import { deleteCustomer } from "@/lib/actions/ledger";
import { Badge, Card, EmptyState, LinkButton, PageHeader, Table, TBody, THead, TH, TR, TD } from "@/components/ui";
import { DeleteButton } from "@/components/forms";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  await requireUser();
  const customers = await allCustomerBalances();
  const symbol = (await getSettings()).currencySymbol;

  return (
    <div>
      <PageHeader title="Customers" description={`${customers.length} customers`}>
        <LinkButton href="/customers/new">+ Add customer</LinkButton>
      </PageHeader>

      {customers.length === 0 ? (
        <EmptyState title="No customers yet" description="Add customers to track credit sales and receivable balances." />
      ) : (
        <Card>
          <Table>
            <THead>
              <TH>Customer</TH>
              <TH>Phone</TH>
              <TH>Credit limit</TH>
              <TH className="text-right">Balance</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            <TBody>
              {customers.map((c) => {
                const owes = c.balance > 0;
                return (
                  <TR key={c.id}>
                    <TD>
                      <LinkButton href={`/customers/${c.id}`} variant="outline" className="border-0 px-0 py-0 hover:bg-transparent font-medium text-zinc-900 dark:text-zinc-50">
                        {c.name}
                      </LinkButton>
                    </TD>
                    <TD>{c.phone ?? "—"}</TD>
                    <TD>{fmtMoney(c.creditLimit, symbol)}</TD>
                    <TD className="text-right">
                      <span className={owes ? "font-semibold text-red-600" : "text-zinc-500"}>
                        {fmtMoney(c.balance, symbol)}
                      </span>
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Badge tone={owes ? "amber" : "green"}>{owes ? "Owes" : "Clear"}</Badge>
                        <LinkButton href={`/customers/${c.id}/edit`} variant="outline" className="px-2 py-1 text-xs">Edit</LinkButton>
                        <DeleteButton action={deleteCustomer.bind(null, c.id)} />
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
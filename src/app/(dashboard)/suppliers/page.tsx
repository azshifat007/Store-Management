import { requireUser } from "@/lib/auth";
import { getSettings, fmtMoney } from "@/lib/utils";
import { allSupplierBalances } from "@/lib/balances";
import { deleteSupplier } from "@/lib/actions/ledger";
import { Badge, Card, EmptyState, LinkButton, PageHeader, Table, TBody, THead, TH, TR, TD } from "@/components/ui";
import { DeleteButton } from "@/components/forms";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  await requireUser();
  const suppliers = await allSupplierBalances();
  const symbol = (await getSettings()).currencySymbol;

  return (
    <div>
      <PageHeader title="Suppliers" description={`${suppliers.length} suppliers`}>
        <LinkButton href="/suppliers/new">+ Add supplier</LinkButton>
      </PageHeader>

      {suppliers.length === 0 ? (
        <EmptyState title="No suppliers yet" description="Add suppliers to track purchases and payable balances." />
      ) : (
        <Card>
          <Table>
            <THead>
              <TH>Supplier</TH>
              <TH>Company</TH>
              <TH>Phone</TH>
              <TH className="text-right">Payable</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            <TBody>
              {suppliers.map((s) => {
                const owes = s.balance > 0;
                return (
                  <TR key={s.id}>
                    <TD>
                      <LinkButton href={`/suppliers/${s.id}`} variant="outline" className="border-0 px-0 py-0 hover:bg-transparent font-medium text-zinc-900 dark:text-zinc-50">
                        {s.name}
                      </LinkButton>
                    </TD>
                    <TD>{s.company ?? "—"}</TD>
                    <TD>{s.phone ?? "—"}</TD>
                    <TD className="text-right">
                      <span className={owes ? "font-semibold text-red-600" : "text-zinc-500"}>
                        {fmtMoney(s.balance, symbol)}
                      </span>
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Badge tone={owes ? "amber" : "green"}>{owes ? "Payable" : "Clear"}</Badge>
                        <LinkButton href={`/suppliers/${s.id}/edit`} variant="outline" className="px-2 py-1 text-xs">Edit</LinkButton>
                        <DeleteButton action={deleteSupplier.bind(null, s.id)} />
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
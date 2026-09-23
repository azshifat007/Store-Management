import { getSettings, fmtMoney, formatDateTime } from "@/lib/utils";
import { Table, TBody, THead, TH, TR, TD } from "@/components/ui";

export async function SalesTable({
  sales,
}: {
  sales: {
    id: string;
    invoiceNo: string;
    saleDate: Date;
    customer: { name: string } | null;
    total: number;
    paidAmount: number;
    paymentType: string;
  }[];
}) {
  const symbol = (await getSettings()).currencySymbol;
  return (
    <Table>
      <THead>
        <TH>Invoice</TH>
        <TH>Date</TH>
        <TH>Customer</TH>
        <TH className="text-right">Total</TH>
        <TH className="text-right">Paid</TH>
        <TH className="text-right">Due</TH>
      </THead>
      <TBody>
        {sales.length === 0 ? (
          <TR><TD colSpan={6} className="py-8 text-center text-zinc-400">No sales yet.</TD></TR>
        ) : (
          sales.map((s) => (
            <TR key={s.id}>
              <TD className="font-mono text-xs">{s.invoiceNo}</TD>
              <TD>{formatDateTime(s.saleDate)}</TD>
              <TD>{s.customer?.name ?? <span className="text-zinc-400">Walk-in</span>}</TD>
              <TD className="text-right">{fmtMoney(s.total, symbol)}</TD>
              <TD className="text-right">{fmtMoney(s.paidAmount, symbol)}</TD>
              <TD className="text-right">
                {s.total - s.paidAmount > 0 ? (
                  <span className="font-semibold text-red-600">{fmtMoney(s.total - s.paidAmount, symbol)}</span>
                ) : (
                  <span className="text-zinc-400">0</span>
                )}
              </TD>
            </TR>
          ))
        )}
      </TBody>
    </Table>
  );
}

export async function PurchasesTable({
  purchases,
}: {
  purchases: {
    id: string;
    invoiceNo: string;
    purchaseDate: Date;
    total: number;
    paidAmount: number;
  }[];
}) {
  const symbol = (await getSettings()).currencySymbol;
  return (
    <Table>
      <THead>
        <TH>Invoice</TH>
        <TH>Date</TH>
        <TH className="text-right">Total</TH>
        <TH className="text-right">Paid</TH>
        <TH className="text-right">Due</TH>
        <TH className="text-right">Items</TH>
      </THead>
      <TBody>
        {purchases.length === 0 ? (
          <TR><TD colSpan={6} className="py-8 text-center text-zinc-400">No purchases yet.</TD></TR>
        ) : (
          purchases.map((p) => (
            <TR key={p.id}>
              <TD className="font-mono text-xs">{p.invoiceNo}</TD>
              <TD>{formatDateTime(p.purchaseDate)}</TD>
              <TD className="text-right">{fmtMoney(p.total, symbol)}</TD>
              <TD className="text-right">{fmtMoney(p.paidAmount, symbol)}</TD>
              <TD className="text-right">
                {p.total - p.paidAmount > 0 ? (
                  <span className="font-semibold text-red-600">{fmtMoney(p.total - p.paidAmount, symbol)}</span>
                ) : (
                  <span className="text-zinc-400">0</span>
                )}
              </TD>
              <TD className="text-right text-zinc-400">—</TD>
            </TR>
          ))
        )}
      </TBody>
    </Table>
  );
}
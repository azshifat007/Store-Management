"use client";

import { useActionState, useMemo, useState } from "react";
import { Alert, Field, Input, LinkButton, Select } from "@/components/ui";
import { SubmitButton } from "@/components/forms";
import type { ActionResult } from "@/lib/actions/types";

type FormAction = (state: ActionResult, formData: FormData) => Promise<ActionResult>;

type ProductOption = {
  id: string;
  name: string;
  unit: string;
  price: number;
  stock?: number;
};

type PartyOption = { id: string; name: string };

type Row = { key: number; productId: string; qty: string; price: string; expiry: string };

let rowCounter = 0;
const nowLocal = new Date();
const defaultDateTime = new Date(
  nowLocal.getTime() - nowLocal.getTimezoneOffset() * 60000
)
  .toISOString()
  .slice(0, 16);
const newRow = (productId = "", price = ""): Row => ({
  key: ++rowCounter,
  productId,
  qty: "1",
  price,
  expiry: "",
});

export function PosForm({
  action,
  products,
  parties,
  partyLabel,
  partyNone,
  linePriceLabel,
  extraChargeLabel,
  extraChargeName,
  dateFieldName,
  showExpiry = false,
  disableParty,
  redirectTo,
  title,
}: {
  action: FormAction;
  products: ProductOption[];
  parties: PartyOption[];
  partyLabel: string;
  partyNone: string;
  linePriceLabel: string;
  extraChargeLabel: string;
  extraChargeName: string;
  dateFieldName: string;
  showExpiry?: boolean;
  disableParty?: boolean;
  redirectTo: string;
  title: string;
}) {
  const [state, formAction] = useActionState(action, {});
  const [rows, setRows] = useState<Row[]>([newRow()]);
  const [discount, setDiscount] = useState("0");
  const [extra, setExtra] = useState("0");
  const [paid, setPaid] = useState("0");

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const subtotal = rows.reduce((sum, r) => {
    const qty = Number(r.qty) || 0;
    const price = Number(r.price) || 0;
    return sum + qty * price;
  }, 0);
  const total = Math.max(0, subtotal + (Number(extra) || 0) - (Number(discount) || 0));
  const due = Math.max(0, total - (Number(paid) || 0));

  function updateRow(key: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, newRow()]);
  }

  function removeRow(key: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error && <Alert>{state.error}</Alert>}

      <Field label="Date and time">
        <Input
          type="datetime-local"
          name={dateFieldName}
          defaultValue={defaultDateTime}
        />
      </Field>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Items</span>
          <button
            type="button"
            onClick={addRow}
            className="rounded-md bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            + Add item
          </button>
        </div>

        <div className="space-y-2">
          {rows.map((row, i) => {
            const lineTotal = (Number(row.qty) || 0) * (Number(row.price) || 0);
            return (
              <div key={row.key} className="flex flex-wrap items-center gap-2 rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
                <input type="hidden" name={`product_${i}`} value={row.productId} />
                <input type="hidden" name={`qty_${i}`} value={row.qty} />
                <input type="hidden" name={`price_${i}`} value={row.price} />
                {showExpiry && <input type="hidden" name={`expiry_${i}`} value={row.expiry} />}

                <Select
                  className="flex-1 min-w-[180px]"
                  value={row.productId}
                  onChange={(e) => {
                    const p = byId.get(e.target.value);
                    updateRow(row.key, {
                      productId: e.target.value,
                      price: p ? String(p.price) : row.price,
                    });
                  }}
                >
                  <option value="">Select {title.toLowerCase()}...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.stock !== undefined ? `(${p.stock} ${p.unit})` : ""}
                    </option>
                  ))}
                </Select>

                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Qty"
                  className="w-24"
                  value={row.qty}
                  onChange={(e) => updateRow(row.key, { qty: e.target.value })}
                />
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder={linePriceLabel}
                  className="w-28"
                  value={row.price}
                  onChange={(e) => updateRow(row.key, { price: e.target.value })}
                />
                {showExpiry && (
                  <Input
                    type="date"
                    className="w-40"
                    value={row.expiry}
                    onChange={(e) => updateRow(row.key, { expiry: e.target.value })}
                  />
                )}

                <span className="w-20 text-right text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  {lineTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>

                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={partyLabel}>
          <Select name="customerId" defaultValue="" disabled={disableParty}>
            <option value="">{partyNone}</option>
            {parties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Payment type">
          <Select name="paymentType" defaultValue="CASH">
            <option value="CASH">Cash</option>
            <option value="CREDIT">Credit</option>
            <option value="BOTH">Both (cash + credit)</option>
          </Select>
        </Field>
        <Field label="Discount">
          <Input type="number" step="any" min="0" name="discount" value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </Field>
        <Field label={extraChargeLabel}>
          <Input type="number" step="any" min="0" name={extraChargeName} value={extra} onChange={(e) => setExtra(e.target.value)} />
        </Field>
        <Field label="Amount paid" hint="For credit sales, the unpaid balance is posted to the ledger.">
          <Input type="number" step="any" min="0" name="paidAmount" value={paid} onChange={(e) => setPaid(e.target.value)} />
        </Field>
        <Field label="Note (optional)">
          <Input name="note" placeholder="Optional note" />
        </Field>
      </div>

      <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
        <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-300">
          <span>Subtotal</span>
          <span className="font-medium">{subtotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm text-zinc-600 dark:text-zinc-300">
          <span>Discount</span>
          <span>− {discount}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm text-zinc-600 dark:text-zinc-300">
          <span>{extraChargeLabel}</span>
          <span>+ {extra}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-50">
          <span>Total</span>
          <span>{total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <span>Due after payment</span>
          <span>{due.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton pendingText="Saving...">{title}</SubmitButton>
        <LinkButton href={redirectTo} variant="outline">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
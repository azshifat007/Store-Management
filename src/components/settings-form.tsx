"use client";

import { useActionState } from "react";
import { Alert, Field, Input } from "@/components/ui";
import { SubmitButton } from "@/components/forms";
import { updateSettings } from "@/lib/actions/settings";

export function SettingsForm({
  storeName,
  storePhone,
  storeAddress,
  currencySymbol,
  taxRate,
  lowStockThreshold,
}: {
  storeName: string;
  storePhone: string | null;
  storeAddress: string | null;
  currencySymbol: string;
  taxRate: number;
  lowStockThreshold: number;
}) {
  const [state, formAction] = useActionState(updateSettings, {});
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert>{state.error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Store name">
          <Input name="storeName" defaultValue={storeName} required />
        </Field>
        <Field label="Currency symbol">
          <Input name="currencySymbol" defaultValue={currencySymbol} />
        </Field>
        <Field label="Phone">
          <Input name="storePhone" defaultValue={storePhone ?? ""} />
        </Field>
        <Field label="Low stock threshold">
          <Input type="number" step="any" min="0" name="lowStockThreshold" defaultValue={lowStockThreshold} />
        </Field>
        <Field label="Tax rate (%)">
          <Input type="number" step="any" min="0" name="taxRate" defaultValue={taxRate} />
        </Field>
      </div>
      <Field label="Address">
        <Input name="storeAddress" defaultValue={storeAddress ?? ""} />
      </Field>
      <SubmitButton pendingText="Saving...">Save settings</SubmitButton>
    </form>
  );
}
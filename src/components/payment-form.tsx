"use client";

import { useActionState } from "react";
import { Alert, Field, Input } from "@/components/ui";
import { SubmitButton } from "@/components/forms";
import type { ActionResult } from "@/lib/actions/types";

type PayAction = (state: ActionResult, formData: FormData) => Promise<ActionResult>;

export function PaymentForm({
  action,
  partyIdField,
  partyId,
  label,
  placeholder,
}: {
  action: PayAction;
  partyIdField: string;
  partyId: string;
  label: string;
  placeholder: string;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-3">
      {state.error && <Alert>{state.error}</Alert>}
      <input type="hidden" name={partyIdField} value={partyId} />
      <Field label={label}>
        <Input type="number" step="any" min="0.01" name="amount" placeholder={placeholder} required />
      </Field>
      <Field label="Note (optional)">
        <Input name="note" placeholder="Reference or method" />
      </Field>
      <SubmitButton>Record payment</SubmitButton>
    </form>
  );
}
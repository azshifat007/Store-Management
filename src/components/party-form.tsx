"use client";

import { useActionState } from "react";
import type { Customer, Supplier } from "@prisma/client";
import { Alert, Field, Input, LinkButton } from "@/components/ui";
import { SubmitButton } from "@/components/forms";
import type { ActionResult } from "@/lib/actions/types";

type Action = (state: ActionResult, formData: FormData) => Promise<ActionResult>;

export function CustomerForm({
  action,
  customer,
}: {
  action: Action;
  customer?: Customer;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert>{state.error}</Alert>}
      {customer && <input type="hidden" name="id" value={customer.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <Input name="name" defaultValue={customer?.name} required />
        </Field>
        <Field label="Phone (optional)">
          <Input name="phone" defaultValue={customer?.phone ?? ""} />
        </Field>
        <Field label="Email (optional)">
          <Input type="email" name="email" defaultValue={customer?.email ?? ""} />
        </Field>
        <Field label="Credit limit">
          <Input type="number" step="any" min="0" name="creditLimit" defaultValue={customer?.creditLimit ?? 0} />
        </Field>
        <Field label="Opening balance" hint="Positive = customer owes you. Only meaningful before any transactions.">
          <Input type="number" step="any" name="openingBalance" defaultValue={customer?.openingBalance ?? 0} />
        </Field>
      </div>
      <Field label="Address (optional)">
        <Input name="address" defaultValue={customer?.address ?? ""} />
      </Field>
      <div className="flex items-center gap-3 pt-2">
        <SubmitButton pendingText={customer ? "Saving..." : "Creating..."}>
          {customer ? "Save changes" : "Create customer"}
        </SubmitButton>
        <LinkButton href="/customers" variant="outline">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}

export function SupplierForm({
  action,
  supplier,
}: {
  action: Action;
  supplier?: Supplier;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert>{state.error}</Alert>}
      {supplier && <input type="hidden" name="id" value={supplier.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <Input name="name" defaultValue={supplier?.name} required />
        </Field>
        <Field label="Company (optional)">
          <Input name="company" defaultValue={supplier?.company ?? ""} />
        </Field>
        <Field label="Phone (optional)">
          <Input name="phone" defaultValue={supplier?.phone ?? ""} />
        </Field>
        <Field label="Email (optional)">
          <Input type="email" name="email" defaultValue={supplier?.email ?? ""} />
        </Field>
      </div>
      <Field label="Address (optional)">
        <Input name="address" defaultValue={supplier?.address ?? ""} />
      </Field>
      <div className="flex items-center gap-3 pt-2">
        <SubmitButton pendingText={supplier ? "Saving..." : "Creating..."}>
          {supplier ? "Save changes" : "Create supplier"}
        </SubmitButton>
        <LinkButton href="/suppliers" variant="outline">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
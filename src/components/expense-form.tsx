"use client";

import { useActionState } from "react";
import type { ExpenseCategory } from "@prisma/client";
import { Alert, Field, Input, Select } from "@/components/ui";
import { SubmitButton } from "@/components/forms";
import { createExpense } from "@/lib/actions/expenses";

export function ExpenseForm({ categories }: { categories: ExpenseCategory[] }) {
  const [state, formAction] = useActionState(createExpense, {});
  return (
    <form action={formAction} className="space-y-3">
      {state.error && <Alert>{state.error}</Alert>}
      <Field label="Category">
        <Select name="categoryId" defaultValue="">
          <option value="" disabled>
            Select category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Amount">
        <Input type="number" step="any" min="0.01" name="amount" required />
      </Field>
      <Field label="Date">
        <Input
          type="date"
          name="expenseDate"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
      </Field>
      <Field label="Note (optional)">
        <Input name="note" />
      </Field>
      <SubmitButton>Save expense</SubmitButton>
    </form>
  );
}
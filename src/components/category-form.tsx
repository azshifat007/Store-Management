"use client";

import { useActionState } from "react";
import type { Category } from "@prisma/client";
import { Alert, Field, Input, Select } from "@/components/ui";
import { SubmitButton } from "@/components/forms";
import type { ActionResult } from "@/lib/actions/types";

type CategoryAction = (
  state: ActionResult,
  formData: FormData
) => Promise<ActionResult>;

export function CategoryForm({
  action,
  categories,
  category,
}: {
  action: CategoryAction;
  categories: Category[];
  category?: Category;
}) {
  const [state, formAction] = useActionState(action, {});
  const options = categories.filter((c) => c.id !== category?.id);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert>{state.error}</Alert>}
      {category && <input type="hidden" name="id" value={category.id} />}
      <Field label="Category name">
        <Input name="name" defaultValue={category?.name} placeholder="e.g. Groceries" required />
      </Field>
      <Field label="Parent category">
        <Select name="parentId" defaultValue={category?.parentId ?? ""}>
          <option value="">None (top level)</option>
          {options.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>
      <SubmitButton pendingText={category ? "Saving..." : "Adding..."}>
        {category ? "Save changes" : "Add category"}
      </SubmitButton>
    </form>
  );
}
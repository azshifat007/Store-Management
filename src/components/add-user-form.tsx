"use client";

import { useActionState } from "react";
import { Alert, Field, Input, Select } from "@/components/ui";
import { SubmitButton } from "@/components/forms";
import { createUser } from "@/lib/actions/settings";

export function AddUserForm() {
  const [state, formAction] = useActionState(createUser, {});
  return (
    <form action={formAction} className="space-y-3">
      {state.error && <Alert>{state.error}</Alert>}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <Input name="name" required />
        </Field>
        <Field label="Email">
          <Input type="email" name="email" required />
        </Field>
        <Field label="Phone (optional)">
          <Input name="phone" />
        </Field>
        <Field label="Role">
          <Select name="role" defaultValue="STAFF">
            <option value="STAFF">Staff</option>
            <option value="OWNER">Owner</option>
          </Select>
        </Field>
        <Field label="Password">
          <Input type="password" name="password" required />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input type="checkbox" name="active" defaultChecked className="h-4 w-4 accent-emerald-600" />
        Active
      </label>
      <SubmitButton>Create user</SubmitButton>
    </form>
  );
}
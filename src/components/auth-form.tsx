"use client";

import { useActionState } from "react";
import { loginAction, registerAction } from "@/lib/actions/auth";
import { Alert, Button, Field, Input } from "@/components/ui";
import type { ActionResult } from "@/lib/actions/types";

const initialState: ActionResult = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert>{state.error}</Alert>}
      <Field label="Email">
        <Input type="email" name="email" placeholder="you@example.com" autoComplete="email" required />
      </Field>
      <Field label="Password">
        <Input type="password" name="password" placeholder="••••••••" autoComplete="current-password" required />
      </Field>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert>{state.error}</Alert>}
      <Field label="Full name">
        <Input name="name" placeholder="Store owner name" autoComplete="name" required />
      </Field>
      <Field label="Email">
        <Input type="email" name="email" placeholder="you@example.com" autoComplete="email" required />
      </Field>
      <Field label="Phone (optional)">
        <Input name="phone" placeholder="01XXXXXXXXX" autoComplete="tel" />
      </Field>
      <Field label="Password">
        <Input type="password" name="password" placeholder="At least 6 characters" autoComplete="new-password" required />
      </Field>
      <Field label="Confirm password">
        <Input type="password" name="confirm" placeholder="Repeat password" autoComplete="new-password" required />
      </Field>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
"use client";

import { useFormStatus } from "react-dom";
import { useTransition } from "react";
import { Button } from "@/components/ui";

export function SubmitButton({
  children = "Save",
  pendingText = "Saving...",
  variant = "primary",
}: {
  children?: React.ReactNode;
  pendingText?: string;
  variant?: "primary" | "secondary" | "danger" | "outline";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending ? pendingText : children}
    </Button>
  );
}

export function DeleteButton({
  action,
  children = "Delete",
  confirmText = "Are you sure you want to delete this? This cannot be undone.",
}: {
  action: () => Promise<{ error?: string } | void>;
  children?: React.ReactNode;
  confirmText?: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmText)) {
          startTransition(async () => {
            const result = await action();
            if (result && "error" in result && result.error) {
              window.alert(result.error);
            }
          });
        }
      }}
      className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
    >
      {pending ? "Deleting..." : children}
    </button>
  );
}
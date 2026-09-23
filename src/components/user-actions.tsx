"use client";

import { useTransition } from "react";
import { resetUserPassword, toggleUserActive } from "@/lib/actions/settings";
import { Badge } from "@/components/ui";

export function UserActions({
  id,
  active,
  self,
  canManage,
}: {
  id: string;
  active: boolean;
  self: boolean;
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function runAction(action: () => Promise<{ error?: string } | void>, confirmMsg: string) {
    if (!window.confirm(confirmMsg)) return;
    startTransition(async () => {
      const result = await action();
      if (result && "error" in result && result.error) window.alert(result.error);
    });
  }

  if (!canManage) {
    return <Badge tone={active ? "green" : "red"}>{active ? "Active" : "Inactive"}</Badge>;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Badge tone={active ? "green" : "red"}>{active ? "Active" : "Inactive"}</Badge>
      <button
        type="button"
        disabled={pending || self}
        onClick={() =>
          runAction(
            () => toggleUserActive(id),
            active
              ? "Deactivate this user? They will be signed out immediately."
              : "Reactivate this user?"
          )
        }
        className="rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {active ? "Deactivate" : "Activate"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          const password = window.prompt("Enter a new password (min 6 characters):");
          if (!password) return;
          const fd = new FormData();
          fd.set("id", id);
          fd.set("password", password);
          startTransition(async () => {
            const result = await resetUserPassword({}, fd);
            if (result && "error" in result && result.error) window.alert(result.error);
            else window.alert("Password updated.");
          });
        }}
        className="rounded-md px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
      >
        Reset password
      </button>
    </div>
  );
}
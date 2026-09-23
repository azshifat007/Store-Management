"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function SearchInput({
  placeholder = "Search...",
  defaultValue = "",
}: {
  placeholder?: string;
  defaultValue?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="relative w-full sm:w-56"
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get("q");
        const sp = q ? `?q=${encodeURIComponent(String(q))}` : "";
        startTransition(() => router.push(sp));
      }}
    >
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">⌕</span>
      <input
        name="q"
        type="search"
        key={defaultValue}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-zinc-300 bg-white py-2 pl-8 pr-3 text-sm placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800"
      />
      {pending && <span className="absolute inset-y-0 right-3 flex items-center text-xs text-zinc-400">…</span>}
    </form>
  );
}
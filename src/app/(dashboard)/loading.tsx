import { Badge, Card, Stat, Table, TBody, THead, TH, TR, TD } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="h-7 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-2 h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5">
            <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="mt-3 h-7 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 rounded bg-zinc-200 dark:bg-zinc-700" />
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded bg-zinc-200 dark:bg-zinc-700" />
              ))}
            </div>
          </Card>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="mt-3 h-7 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

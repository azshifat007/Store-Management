import { getSettings } from "@/lib/utils";

export default async function AuthShell({
  title,
  subtitle,
  hint,
  children,
}: {
  title: string;
  subtitle: string;
  hint: React.ReactNode;
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {settings.storeName}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 text-center">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
            <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
          </div>
          {children}
        </div>
        <p className="mt-6 text-center text-sm text-zinc-500">{hint}</p>
      </div>
    </div>
  );
}
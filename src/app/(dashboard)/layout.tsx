import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import Sidebar from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar
        storeName={settings.storeName}
        userName={user.name}
        role={user.role}
      />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
        <form action={logoutAction} className="mt-8 md:hidden">
          <button
            type="submit"
            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-red-50 hover:text-red-600 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-red-950 dark:hover:text-red-400"
          >
            Sign out
          </button>
        </form>
      </main>
    </div>
  );
}
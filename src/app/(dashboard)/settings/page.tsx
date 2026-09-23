import { prisma } from "@/lib/prisma";
import { requireUser, isRole } from "@/lib/auth";
import { getSettings, formatDateTime } from "@/lib/utils";
import { Role } from "@prisma/client";
import { Badge, Card, PageHeader, Table, TBody, THead, TH, TR, TD } from "@/components/ui";
import { SettingsForm } from "@/components/settings-form";
import { UserActions } from "@/components/user-actions";
import { AddUserForm } from "@/components/add-user-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = await getSettings();
  const isOwner = isRole(user, Role.OWNER);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <PageHeader title="Settings" description="Store details and user management." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Store information</h2>
          <SettingsForm
            storeName={settings.storeName}
            storePhone={settings.storePhone}
            storeAddress={settings.storeAddress}
            currencySymbol={settings.currencySymbol}
            taxRate={settings.taxRate}
            lowStockThreshold={settings.lowStockThreshold}
          />
        </Card>

        <div className="space-y-6">
          {isOwner && (
            <Card className="p-6">
              <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Add user</h2>
              <AddUserForm />
            </Card>
          )}

          <Card>
            <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Users</h2>
            </div>
            {!isOwner && (
              <div className="px-4 py-3 text-xs text-zinc-500">
                Only the owner can manage users.
              </div>
            )}
            <Table>
              <THead>
                <TH>Name</TH>
                <TH>Email</TH>
                <TH>Role</TH>
                <TH>Created</TH>
                <TH className="text-right">Status</TH>
              </THead>
              <TBody>
                {users.map((u) => (
                  <TR key={u.id}>
                    <TD className="font-medium text-zinc-900 dark:text-zinc-50">
                      {u.name}
                      {u.id === user.id && <span className="ml-1 text-xs text-zinc-400">(you)</span>}
                    </TD>
                    <TD>{u.email}</TD>
                    <TD>
                      <Badge tone={u.role === Role.OWNER ? "blue" : "neutral"}>
                        {u.role === Role.OWNER ? "Owner" : "Staff"}
                      </Badge>
                    </TD>
                    <TD>{formatDateTime(u.createdAt)}</TD>
                    <TD className="text-right">
                      <UserActions
                        id={u.id}
                        active={u.active}
                        self={u.id === user.id}
                        canManage={isOwner}
                      />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
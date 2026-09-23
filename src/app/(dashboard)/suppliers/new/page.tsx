import { requireUser } from "@/lib/auth";
import { createSupplier } from "@/lib/actions/ledger";
import { Card, PageHeader } from "@/components/ui";
import { SupplierForm } from "@/components/party-form";

export const metadata = { title: "New supplier" };

export default async function NewSupplierPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Add supplier" description="Create a supplier to track purchases and payable." />
      <Card className="p-6">
        <SupplierForm action={createSupplier} />
      </Card>
    </div>
  );
}
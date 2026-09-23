import { requireUser } from "@/lib/auth";
import { createCustomer } from "@/lib/actions/ledger";
import { Card, PageHeader } from "@/components/ui";
import { CustomerForm } from "@/components/party-form";

export const metadata = { title: "New customer" };

export default async function NewCustomerPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Add customer" description="Create a customer to track credit sales and receivable." />
      <Card className="p-6">
        <CustomerForm action={createCustomer} />
      </Card>
    </div>
  );
}
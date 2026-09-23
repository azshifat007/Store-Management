import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { updateCustomer } from "@/lib/actions/ledger";
import { Card, PageHeader } from "@/components/ui";
import { CustomerForm } from "@/components/party-form";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Edit customer" description={customer.name} />
      <Card className="p-6">
        <CustomerForm action={updateCustomer} customer={customer} />
      </Card>
    </div>
  );
}
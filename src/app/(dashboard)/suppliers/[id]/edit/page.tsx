import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { updateSupplier } from "@/lib/actions/ledger";
import { Card, PageHeader } from "@/components/ui";
import { SupplierForm } from "@/components/party-form";

export const dynamic = "force-dynamic";

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Edit supplier" description={supplier.name} />
      <Card className="p-6">
        <SupplierForm action={updateSupplier} supplier={supplier} />
      </Card>
    </div>
  );
}
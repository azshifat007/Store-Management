import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { createPurchase } from "@/lib/actions/purchases";
import { Card, PageHeader } from "@/components/ui";
import { PosForm } from "@/components/pos-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "New purchase" };

export default async function NewPurchasePage() {
  await requireUser();
  const [products, suppliers] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, unit: true, costPrice: true },
    }),
    prisma.supplier.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="New purchase" description="Record a stock purchase and optionally update the supplier ledger." />
      <Card className="p-6">
        <PosForm
          action={createPurchase}
          title="Save purchase"
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            unit: p.unit,
            price: p.costPrice,
          }))}
          parties={suppliers}
          partyLabel="Supplier"
          partyNone="No supplier (cash purchase)"
          linePriceLabel="Unit cost"
          extraChargeLabel="Other charge"
          extraChargeName="otherCharge"
          dateFieldName="purchaseDate"
          showExpiry
          redirectTo="/purchases"
        />
      </Card>
    </div>
  );
}
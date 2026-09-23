import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { createSale } from "@/lib/actions/sales";
import { Card, PageHeader } from "@/components/ui";
import { PosForm } from "@/components/pos-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "New sale" };

export default async function NewSalePage() {
  await requireUser();
  const [products, customers] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, unit: true, sellPrice: true, stockQuantity: true },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="New sale" description="Select products, quantities and payment details." />
      <Card className="p-6">
        <PosForm
          action={createSale}
          title="Save sale"
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            unit: p.unit,
            price: p.sellPrice,
            stock: p.stockQuantity,
          }))}
          parties={customers}
          partyLabel="Customer"
          partyNone="Walk-in (cash)"
          linePriceLabel="Sell price"
          extraChargeLabel="Delivery charge"
          extraChargeName="deliveryCharge"
          dateFieldName="saleDate"
          redirectTo="/sales"
        />
      </Card>
    </div>
  );
}
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { createProduct } from "@/lib/actions/catalog";
import { Card, PageHeader } from "@/components/ui";
import { ProductForm } from "@/components/product-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireUser();
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Add product" description="Create a new product in your catalog." />
      <Card className="p-6">
        <ProductForm action={createProduct} categories={categories} />
      </Card>
    </div>
  );
}
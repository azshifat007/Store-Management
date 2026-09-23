import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { updateProduct } from "@/lib/actions/catalog";
import { Card, PageHeader } from "@/components/ui";
import { ProductForm } from "@/components/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Edit product" description={product.name} />
      <Card className="p-6">
        <ProductForm action={updateProduct} categories={categories} product={product} />
      </Card>
    </div>
  );
}
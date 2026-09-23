import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { updateCategory } from "@/lib/actions/catalog";
import { Card, PageHeader } from "@/components/ui";
import { CategoryForm } from "@/components/category-form";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const [category, categories] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Edit category" description={category.name} />
      <Card className="p-6">
        <CategoryForm action={updateCategory} categories={categories} category={category} />
      </Card>
    </div>
  );
}
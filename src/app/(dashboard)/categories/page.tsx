import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { createCategory, deleteCategory } from "@/lib/actions/catalog";
import {
  Badge,
  Card,
  EmptyState,
  LinkButton,
  PageHeader,
  Table,
  TBody,
  THead,
  TH,
  TR,
  TD,
} from "@/components/ui";
import { DeleteButton } from "@/components/forms";
import { CategoryForm } from "@/components/category-form";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requireUser();
  const categories = await prisma.category.findMany({
    include: { parent: true, _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader title="Categories" description="Organize products into categories and subcategories." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Add category</h2>
          <CategoryForm action={createCategory} categories={categories} />
        </Card>
        <div className="lg:col-span-2">
          {categories.length === 0 ? (
            <EmptyState title="No categories yet" description="Create your first category to organize products." />
          ) : (
            <Card>
              <Table>
                <THead>
                  <TH>Name</TH>
                  <TH>Parent</TH>
                  <TH className="text-right">Products</TH>
                  <TH className="text-right">Actions</TH>
                </THead>
                <TBody>
                  {categories.map((c) => (
                    <TR key={c.id}>
                      <TD className="font-medium text-zinc-900 dark:text-zinc-50">{c.name}</TD>
                      <TD>{c.parent?.name ?? <Badge tone="neutral">Top-level</Badge>}</TD>
                      <TD className="text-right">{c._count.products}</TD>
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <LinkButton href={`/categories/${c.id}/edit`} variant="outline" className="px-2 py-1 text-xs">
                            Edit
                          </LinkButton>
                          <DeleteButton action={deleteCategory.bind(null, c.id)} />
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
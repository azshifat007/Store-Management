import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getSettings, fmtMoney, formatDate } from "@/lib/utils";
import { deleteProduct } from "@/lib/actions/catalog";
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
import { SearchInput } from "@/components/search";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireUser();
  const { q } = await searchParams;
  const symbol = (await getSettings()).currencySymbol;

  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { barcode: { contains: q } },
            { category: { name: { contains: q } } },
          ],
        }
      : undefined,
    include: { category: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader title="Products" description={`${products.length} products in catalog`}>
        <SearchInput placeholder="Search products..." />
        <LinkButton href="/products/new">+ Add product</LinkButton>
      </PageHeader>

      {products.length === 0 ? (
        <EmptyState
          title={q ? "No products match your search" : "No products yet"}
          description={q ? "Try a different keyword." : "Add your first product to start selling."}
        />
      ) : (
        <Card>
          <Table>
            <THead>
              <TH>Product</TH>
              <TH>Category</TH>
              <TH>Cost</TH>
              <TH>Sell price</TH>
              <TH className="text-right">Stock</TH>
              <TH>Expiry</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            <TBody>
              {products.map((p) => {
                const low = p.stockQuantity <= p.lowStockThreshold;
                return (
                  <TR key={p.id}>
                    <TD>
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">{p.name}</div>
                      {p.barcode && <div className="text-xs text-zinc-400">{p.barcode}</div>}
                    </TD>
                    <TD>{p.category?.name ?? <span className="text-zinc-400">—</span>}</TD>
                    <TD>{fmtMoney(p.costPrice, symbol)}</TD>
                    <TD>{fmtMoney(p.sellPrice, symbol)}</TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={low ? "font-semibold text-red-600" : ""}>
                          {p.stockQuantity} {p.unit}
                        </span>
                        {low ? <Badge tone="red">Low</Badge> : null}
                      </div>
                    </TD>
                    <TD>{p.expiryDate ? formatDate(p.expiryDate) : <span className="text-zinc-400">—</span>}</TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <LinkButton href={`/products/${p.id}/edit`} variant="outline" className="px-2 py-1 text-xs">
                          Edit
                        </LinkButton>
                        <DeleteButton action={deleteProduct.bind(null, p.id)} />
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
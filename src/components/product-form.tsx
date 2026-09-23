"use client";

import { useActionState } from "react";
import type { Category, Product } from "@prisma/client";
import { Alert, Field, Input, LinkButton, Select } from "@/components/ui";
import { SubmitButton } from "@/components/forms";
import type { ActionResult } from "@/lib/actions/types";

type ProductAction = (
  state: ActionResult,
  formData: FormData
) => Promise<ActionResult>;

export function ProductForm({
  action,
  categories,
  product,
}: {
  action: ProductAction;
  categories: Category[];
  product?: Product;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert>{state.error}</Alert>}
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Product name">
          <Input name="name" defaultValue={product?.name} placeholder="e.g. Basmati Rice 5kg" required />
        </Field>
        <Field label="Category">
          <Select name="categoryId" defaultValue={product?.categoryId ?? ""}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Unit">
          <Input name="unit" defaultValue={product?.unit ?? "pcs"} placeholder="pcs, kg, ltr" />
        </Field>
        <Field label="Barcode (optional)">
          <Input name="barcode" defaultValue={product?.barcode ?? ""} placeholder="Scan or type barcode" />
        </Field>
        <Field label="Cost price">
          <Input type="number" step="any" min="0" name="costPrice" defaultValue={product?.costPrice ?? 0} required />
        </Field>
        <Field label="Sell price">
          <Input type="number" step="any" min="0" name="sellPrice" defaultValue={product?.sellPrice ?? 0} required />
        </Field>
        <Field label="Opening stock (only on create)">
          <Input
            type="number"
            step="any"
            min="0"
            name="stockQuantity"
            defaultValue={product?.stockQuantity ?? 0}
            disabled={!!product}
          />
        </Field>
        <Field label="Low stock threshold">
          <Input type="number" step="any" min="0" name="lowStockThreshold" defaultValue={product?.lowStockThreshold ?? 0} />
        </Field>
        <Field label="Expiry date (optional)">
          <Input type="date" name="expiryDate" defaultValue={product?.expiryDate?.toISOString().slice(0, 10) ?? ""} />
        </Field>
        <label className="flex items-center gap-2 pt-6 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            name="active"
            defaultChecked={product ? product.active : true}
            className="h-4 w-4 rounded border-zinc-300 accent-emerald-600"
          />
          Active (visible and sellable)
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton pendingText={product ? "Saving..." : "Creating..."}>
          {product ? "Save changes" : "Create product"}
        </SubmitButton>
        <LinkButton href="/products" variant="outline">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
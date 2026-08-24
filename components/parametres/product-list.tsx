"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Pills, type PillOption } from "@/components/ui/pills";
import { SearchInput } from "@/components/ui/search-input";
import { Switch } from "@/components/ui/switch";
import { PencilIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import {
  COMPANY_OPTIONS,
  DEPOT_OPTIONS,
  formatFCFA,
  isLowStock,
  lowStockCount,
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCTS,
  type Product,
} from "@/lib/data/parametres-catalogue";
import { ProductEditDialog } from "@/components/parametres/product-edit-dialog";
import { ProductCategoryDialog } from "@/components/parametres/product-category-dialog";

const CATEGORY_PILLS: PillOption[] = [
  { value: "tous", label: "Tous" },
  ...PRODUCT_CATEGORY_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
];

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-full border border-[var(--color-gray-200)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-gray-700)] focus:border-[var(--brand-taupe-muted)] focus:outline-none"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function ProductCard({ product, onEdit }: { product: Product; onEdit: () => void }) {
  const lowStock = isLowStock(product);
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-rose-soft)] text-lg">
          🧴
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-[15px] font-semibold text-[var(--color-gray-900)]", !product.active && "text-[var(--color-gray-400)]")}>
            {product.name}
          </p>
          <p className="text-xs text-[var(--color-gray-400)]">SKU {product.sku}</p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-bold text-[var(--brand-taupe-muted)]">{formatFCFA(product.priceSale)}</span>
            <span className="text-[var(--color-gray-400)]">Cout : {formatFCFA(product.priceCost)}</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {lowStock ? (
              <Badge variant="error" icon={<span aria-hidden>{product.stock === 0 ? "📉" : "📊"}</span>}>
                {product.stock} en stock
              </Badge>
            ) : (
              <Badge variant="success" icon={<span aria-hidden>📊</span>}>
                {product.stock} en stock
              </Badge>
            )}
            {product.foreignCurrency && (
              <Badge variant="info" icon={<span aria-hidden>🌐</span>}>
                {product.foreignCurrency}
              </Badge>
            )}
            {product.productType === "revente" ? (
              <Badge variant="success">Revente</Badge>
            ) : (
              <Badge variant="dark" className="bg-[var(--brand-lilac)] text-[var(--text-secondary)]">
                Backbar
              </Badge>
            )}
          </div>

          {product.supplier && (
            <p className="mt-1.5 text-xs text-[var(--color-gray-500)]">Fournisseur : {product.supplier}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Modifier ${product.name}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--color-gray-400)] hover:bg-[var(--color-gray-100)] hover:text-[var(--brand-taupe-muted)]"
        >
          <PencilIcon />
        </button>
      </div>
    </Card>
  );
}

/** Orchestrateur client de "Gestion Produits" : entreprise/dépôt, alerte stock, recherche,
 * filtre catégorie, switch inactifs, liste groupée, modales Categories / Modifier le produit. */
export function ProductList() {
  const [company, setCompany] = useState(COMPANY_OPTIONS[0].value);
  const [depot, setDepot] = useState(DEPOT_OPTIONS[0].value);
  const [category, setCategory] = useState("tous");
  const [query, setQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [products, setProducts] = useState(PRODUCTS);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>(undefined);
  const [editorOpen, setEditorOpen] = useState(false);

  const lowCount = useMemo(() => lowStockCount(products), [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      if (!showInactive && !product.active) return false;
      if (category !== "tous" && product.category !== category) return false;
      if (
        q &&
        !product.name.toLowerCase().includes(q) &&
        !product.sku.toLowerCase().includes(q) &&
        !(product.supplier ?? "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [category, products, query, showInactive]);

  const groups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, Product[]>();
    for (const product of filtered) {
      const label = PRODUCT_CATEGORY_LABELS[product.category];
      if (!map.has(label)) {
        map.set(label, []);
        order.push(label);
      }
      map.get(label)!.push(product);
    }
    return order.map((label) => ({ label, products: map.get(label)! }));
  }, [filtered]);

  function openCreate() {
    setEditing(undefined);
    setEditorOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setEditorOpen(true);
  }

  function handleSave(product: Product) {
    setProducts((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      return exists ? prev.map((item) => (item.id === product.id ? product : item)) : [product, ...prev];
    });
    setEditorOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/parametres"
        title="Gestion Produits"
        subtitle="Stock, prix, fournisseurs"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCategoriesOpen(true)}>
              📁 Categories
            </Button>
            <Button variant="brand" onClick={openCreate} icon={<span aria-hidden>+</span>}>
              Ajouter
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-3">
        <SelectField value={company} onChange={setCompany} options={COMPANY_OPTIONS} />
        <SelectField value={depot} onChange={setDepot} options={DEPOT_OPTIONS} />
      </div>

      {lowCount > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-[var(--color-warning-soft)] px-4 py-3 text-sm text-[var(--color-warning)]">
          <span className="flex items-center gap-2 font-medium">
            <span aria-hidden>⚠️</span> {lowCount} produits en stock bas
          </span>
          <button type="button" onClick={() => setShowInactive(true)} className="font-semibold underline underline-offset-2">
            Filtrer
          </button>
        </div>
      )}

      <SearchInput
        placeholder="Rechercher par nom, SKU, fournisseur..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <Pills options={CATEGORY_PILLS} value={category} onChange={setCategory} />

      <div className="flex items-center gap-3">
        <Switch checked={showInactive} onChange={setShowInactive} label="Afficher les produits inactifs" />
        <span className="text-sm text-[var(--color-gray-600)]">Afficher les produits inactifs</span>
      </div>

      <div className="space-y-6">
        {groups.length === 0 && (
          <p className="py-10 text-center text-sm text-[var(--color-gray-400)]">Aucun produit trouvé.</p>
        )}
        {groups.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
              {group.label} <span className="text-[var(--color-gray-400)]">({group.products.length})</span>
            </p>
            <div className="space-y-2">
              {group.products.map((product) => (
                <ProductCard key={product.id} product={product} onEdit={() => openEdit(product)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <ProductCategoryDialog open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />
      <ProductEditDialog
        open={editorOpen}
        product={editing}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

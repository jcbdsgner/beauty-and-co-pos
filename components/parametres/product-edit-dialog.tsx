"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_CATEGORY_TREE,
  type Product,
  type ProductType,
} from "@/lib/data/parametres-catalogue";

type ProductEditDialogProps = {
  open: boolean;
  /** undefined = création ("+ Ajouter"), défini = édition (crayon sur une carte). */
  product?: Product;
  onClose: () => void;
  onSave: (product: Product) => void;
};

const fieldClass =
  "w-full rounded-xl border border-transparent bg-[var(--brand-rose-soft)] px-4 py-2.5 text-[15px] text-[var(--color-gray-900)] placeholder:text-[var(--color-gray-400)] focus:border-[var(--brand-taupe-muted)] focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-[var(--color-gray-600)]";

function blankProduct(): Product {
  return {
    id: `prd-${Date.now()}`,
    name: "",
    sku: "",
    category: PRODUCT_CATEGORY_OPTIONS[0].value,
    priceSale: 0,
    priceCost: 0,
    stock: 0,
    lowStockThreshold: 5,
    productType: "revente",
    active: true,
  };
}

/** "Modifier le produit" bottom-sheet modal — même formulaire pour la création ("+ Ajouter",
 * product=undefined) et l'édition (crayon sur une carte produit). The form itself lives in
 * `ProductEditForm`, mounted only while `open` — since `Dialog` unmounts its children when
 * closed, remounting it is what resets the draft to the current product, no effect needed. */
export function ProductEditDialog({ open, product, onClose, onSave }: ProductEditDialogProps) {
  return (
    <Dialog open={open} labelledBy="product-edit-title" className="max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl">
      {open && <ProductEditForm product={product} onClose={onClose} onSave={onSave} />}
    </Dialog>
  );
}

function ProductEditForm({
  product,
  onClose,
  onSave,
}: {
  product?: Product;
  onClose: () => void;
  onSave: (product: Product) => void;
}) {
  const [draft, setDraft] = useState<Product>(() => product ?? blankProduct());

  const subCategories = PRODUCT_CATEGORY_TREE.find(
    (node) => node.label === PRODUCT_CATEGORY_OPTIONS.find((option) => option.value === draft.category)?.label,
  )?.children;

  function update<K extends keyof Product>(key: K, value: Product[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSave(draft);
  }

  return (
    <>
      <div className="flex justify-center pt-3">
        <div className="h-1 w-10 rounded-full bg-[var(--color-gray-200)]" />
      </div>
      <div className="flex items-start justify-between px-6 pt-4">
        <h2 id="product-edit-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
          Modifier le produit
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--color-gray-400)] hover:bg-[var(--color-gray-100)]"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-[var(--color-gray-300)] bg-[var(--color-gray-50)] text-[var(--color-gray-400)]">
            <CameraIcon />
            <span className="text-[10px]">Photo</span>
          </div>
          <p className="text-sm text-[var(--color-gray-500)]">
            Photo du produit (optionnel)
            <br />
            JPG, PNG ou WebP. Max 5 Mo.
          </p>
        </div>

        <div>
          <label className={labelClass}>Nom du produit *</label>
          <input
            required
            value={draft.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Ex : Apres-shampoing Kerastase 200ml"
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>SKU (Reference) *</label>
          <input
            required
            value={draft.sku}
            onChange={(event) => update("sku", event.target.value)}
            placeholder="BC-XXX-000"
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-[var(--color-gray-400)]">Genere automatiquement. Modifiable.</p>
        </div>

        <div>
          <label className={labelClass}>Categorie *</label>
          <select
            value={draft.category}
            onChange={(event) => {
              update("category", event.target.value as Product["category"]);
              update("subCategory", undefined as unknown as string);
            }}
            className={fieldClass}
          >
            {PRODUCT_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Sous-categorie</label>
          <select
            value={draft.subCategory ?? ""}
            onChange={(event) => update("subCategory", event.target.value || undefined)}
            className={fieldClass}
          >
            <option value="">-- Aucune --</option>
            {subCategories?.map((child) => (
              <option key={child} value={child}>
                {child}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Prix vente (FCFA) *</label>
            <input
              required
              type="number"
              min={0}
              value={draft.priceSale}
              onChange={(event) => update("priceSale", Number(event.target.value))}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Prix d&apos;achat (FCFA)</label>
            <input
              type="number"
              min={0}
              value={draft.priceCost}
              onChange={(event) => update("priceCost", Number(event.target.value))}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={!!draft.foreignCurrency}
            onChange={(checked) => update("foreignCurrency", checked ? "USD" : undefined)}
            label="Achete a l'etranger"
          />
          <span className="text-sm text-[var(--color-gray-700)]">🌐 Achete a l&apos;etranger</span>
        </div>

        <div>
          <label className={labelClass}>Fournisseur</label>
          <input
            value={draft.supplier ?? ""}
            onChange={(event) => update("supplier", event.target.value)}
            placeholder="Ex : Kerastase"
            className={fieldClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Stock minimum alerte</label>
            <input
              type="number"
              min={0}
              value={draft.lowStockThreshold}
              onChange={(event) => update("lowStockThreshold", Number(event.target.value))}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Type de produit</label>
            <div className="flex gap-2">
              {(["revente", "backbar"] as ProductType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => update("productType", type)}
                  className={cn(
                    "flex-1 rounded-full px-3 py-2 text-sm font-semibold capitalize transition",
                    draft.productType === type
                      ? "bg-[var(--core-brand-color)] text-black"
                      : "border border-[var(--color-gray-200)] bg-white text-[var(--color-gray-600)]",
                  )}
                >
                  {type === "revente" ? "Revente" : "Backbar"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="-mt-3 text-xs text-[var(--color-gray-400)]">
          Revente = vendu à la cliente · Backbar = utilisé en prestation
        </p>

        <div className="rounded-2xl border border-[var(--color-gray-200)] bg-[var(--brand-cream)] p-4 text-sm text-[var(--color-gray-600)]">
          Note : Le prix defini ici sera applique au POS et ne pourra pas etre modifie par les caissiers. Le stock est
          gere separement par salon et par depot.
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" variant="brand" className="flex-1">
            ✓ Enregistrer
          </Button>
        </div>
      </form>
    </>
  );
}

function CameraIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-5">
      <path
        d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

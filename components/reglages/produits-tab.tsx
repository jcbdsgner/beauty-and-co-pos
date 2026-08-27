"use client";

import { useState } from "react";
import { ArticleList } from "@/components/reglages/article-list";
import { ProduitFormDialog, type ManagedProduit } from "@/components/reglages/produit-form-dialog";
import { CategoriesDialog } from "@/components/reglages/categories-dialog";
import { PRODUITS, PRODUCT_CATEGORIES } from "@/lib/data/catalogue";
import { COMPANIES } from "@/lib/data/entreprises";
import type { ProductCategory } from "@/lib/data/types";

let uid = 0;
function nextId(prefix: string) {
  uid += 1;
  return `${prefix}-${Date.now()}-${uid}`;
}

const INITIAL_PRODUITS: ManagedProduit[] = PRODUITS.map((p) => ({ ...p, companyId: COMPANIES[0]?.id ?? "", photos: [] }));

/** Session-only CRUD over PRODUITS/PRODUCT_CATEGORIES — companyId/photos are local-only extensions (Produit in lib/data/types.ts has neither yet, cf. produit-form-dialog.tsx). */
export function ProduitsTab() {
  const [produits, setProduits] = useState<ManagedProduit[]>(INITIAL_PRODUITS);
  const [categories, setCategories] = useState<ProductCategory[]>(PRODUCT_CATEGORIES);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editing, setEditing] = useState<ManagedProduit | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  return (
    <>
      <ArticleList<ManagedProduit>
        items={produits}
        categories={categories}
        secondaryHeader="Stock"
        renderSecondary={(p) => (p.stock === 0 ? <span className="font-semibold text-[var(--color-error)]">Rupture</span> : `${p.stock}`)}
        onToggleActive={(item, active) => setProduits((prev) => prev.map((p) => (p.id === item.id ? { ...p, active } : p)))}
        onAdd={() => {
          setFormMode("add");
          setEditing(null);
          setFormOpen(true);
        }}
        onEdit={(item) => {
          setFormMode("edit");
          setEditing(item);
          setFormOpen(true);
        }}
        onManageCategories={() => setCategoriesOpen(true)}
        addLabel="Ajouter un produit"
        searchPlaceholder="Rechercher un produit…"
      />

      <ProduitFormDialog
        open={formOpen}
        mode={formMode}
        produit={editing}
        categories={categories}
        companies={COMPANIES}
        defaultCategoryId={categories[0]?.id ?? ""}
        defaultCompanyId={COMPANIES[0]?.id ?? ""}
        onClose={() => setFormOpen(false)}
        onSubmit={(values) => {
          if (formMode === "add") {
            setProduits((prev) => [...prev, { ...values, id: nextId("prd") }]);
          } else if (editing) {
            setProduits((prev) => prev.map((p) => (p.id === editing.id ? { ...values, id: editing.id } : p)));
          }
          setFormOpen(false);
        }}
        onDelete={(id) => setProduits((prev) => prev.filter((p) => p.id !== id))}
      />

      <CategoriesDialog
        open={categoriesOpen}
        onClose={() => setCategoriesOpen(false)}
        title="Catégories de produits"
        categories={categories}
        itemCount={(categoryId) => produits.filter((p) => p.categoryId === categoryId).length}
        onAdd={(name) => setCategories((prev) => [...prev, { id: nextId("cat"), name }])}
        onRename={(id, name) => setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))}
        onDelete={(id) => setCategories((prev) => prev.filter((c) => c.id !== id))}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import { ArticleList } from "@/components/reglages/article-list";
import { ServiceFormDialog } from "@/components/reglages/service-form-dialog";
import { CategoriesDialog } from "@/components/reglages/categories-dialog";
import { SERVICES, SERVICE_CATEGORIES } from "@/lib/data/catalogue";
import type { Service, ServiceCategory } from "@/lib/data/types";

let uid = 0;
function nextId(prefix: string) {
  uid += 1;
  return `${prefix}-${Date.now()}-${uid}`;
}

/** Session-only CRUD over SERVICES/SERVICE_CATEGORIES — lifted into local state per AGENTS.md (lib/data/types.ts is being edited elsewhere, so no shared mutation state is added there). */
export function ServicesTab() {
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [categories, setCategories] = useState<ServiceCategory[]>(SERVICE_CATEGORIES);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editing, setEditing] = useState<Service | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  return (
    <>
      <ArticleList<Service>
        items={services}
        categories={categories}
        secondaryHeader="Durée"
        renderSecondary={(s) => `${s.durationMinutes} min`}
        onToggleActive={(item, active) => setServices((prev) => prev.map((s) => (s.id === item.id ? { ...s, active } : s)))}
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
        addLabel="Ajouter un service"
        searchPlaceholder="Rechercher un service…"
      />

      <ServiceFormDialog
        open={formOpen}
        mode={formMode}
        service={editing}
        categories={categories}
        defaultCategoryId={categories[0]?.id ?? ""}
        onClose={() => setFormOpen(false)}
        onSubmit={(values) => {
          if (formMode === "add") {
            setServices((prev) => [...prev, { ...values, id: nextId("srv") }]);
          } else if (editing) {
            setServices((prev) => prev.map((s) => (s.id === editing.id ? { ...values, id: editing.id } : s)));
          }
          setFormOpen(false);
        }}
        onDelete={(id) => setServices((prev) => prev.filter((s) => s.id !== id))}
      />

      <CategoriesDialog
        open={categoriesOpen}
        onClose={() => setCategoriesOpen(false)}
        title="Catégories de services"
        categories={categories}
        itemCount={(categoryId) => services.filter((s) => s.categoryId === categoryId).length}
        onAdd={(name) => setCategories((prev) => [...prev, { id: nextId("cat"), name }])}
        onRename={(id, name) => setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))}
        onDelete={(id) => setCategories((prev) => prev.filter((c) => c.id !== id))}
      />
    </>
  );
}

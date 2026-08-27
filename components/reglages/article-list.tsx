"use client";

import { useMemo, useState } from "react";
import { Toolbar } from "@/components/ui/organisms/toolbar";
import { DataTable, type DataTableColumn } from "@/components/ui/organisms/data-table";
import { Switch } from "@/components/ui/atoms/switch";
import { Button } from "@/components/ui/atoms/button";
import { IconButton } from "@/components/ui/atoms/icon-button";
import { FieldLabel } from "@/components/ui/atoms/field-label";
import { PencilIcon, PlusIcon } from "@/components/ui/atoms/icons";
import { formatFcfa } from "@/lib/utils";
import type { PillOption } from "@/components/ui/molecules/pills";

export type ArticleBase = {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  active: boolean;
};

type ArticleCategory = { id: string; name: string };

type ArticleListProps<T extends ArticleBase> = {
  items: T[];
  categories: ArticleCategory[];
  /** Column header for the module-specific third column ("Durée" for Services, "Stock" for Produits). */
  secondaryHeader: string;
  renderSecondary: (item: T) => React.ReactNode;
  onToggleActive: (item: T, active: boolean) => void;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onManageCategories: () => void;
  addLabel: string;
  searchPlaceholder: string;
};

/**
 * Shared Services/Produits screen — Toolbar (search + category pills + "+ Ajouter") + a single
 * "Afficher les inactifs" Switch (never a second redundant control) + a DataTable grouped by
 * category. Per USERFLOW.md's Réglages spec: "structure désormais identique dans les deux".
 */
export function ArticleList<T extends ArticleBase>({
  items,
  categories,
  secondaryHeader,
  renderSecondary,
  onToggleActive,
  onAdd,
  onEdit,
  onManageCategories,
  addLabel,
  searchPlaceholder,
}: ArticleListProps<T>) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("toutes");
  const [showInactive, setShowInactive] = useState(false);

  const visibleBase = items.filter((i) => showInactive || i.active);

  const categoryOptions: PillOption[] = useMemo(
    () => [
      { value: "toutes", label: "Toutes", count: visibleBase.length },
      ...categories.map((c) => ({ value: c.id, label: c.name, count: visibleBase.filter((i) => i.categoryId === c.id).length })),
    ],
    [categories, visibleBase],
  );

  const filtered = visibleBase.filter((item) => {
    const matchesQuery = item.name.toLowerCase().includes(query.trim().toLowerCase());
    const matchesCategory = categoryFilter === "toutes" || item.categoryId === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  const columns: DataTableColumn<T>[] = [
    {
      key: "name",
      header: "Nom",
      render: (item) => (
        <span className={item.active ? "font-medium text-[var(--color-gray-900)]" : "font-medium text-[var(--color-gray-400)]"}>{item.name}</span>
      ),
    },
    { key: "price", header: "Prix", render: (item) => formatFcfa(item.price) },
    { key: "secondary", header: secondaryHeader, render: renderSecondary },
    {
      key: "active",
      header: "Actif",
      align: "center",
      render: (item) => (
        // Stop propagation so flipping the switch never also fires the row's onClick (which opens the edit dialog) — one toggle, one action.
        <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
          <Switch checked={item.active} onChange={(v) => onToggleActive(item, v)} label={`${item.active ? "Désactiver" : "Activer"} ${item.name}`} />
        </div>
      ),
    },
    {
      key: "edit",
      header: "",
      align: "right",
      render: (item) => (
        <IconButton
          aria-label={`Modifier ${item.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
          className="size-11 rounded-full text-[var(--color-gray-400)] transition active:scale-90 active:bg-[var(--brand-rose-soft)] active:text-[var(--brand-taupe-muted)] hover:bg-[var(--brand-rose-soft)] hover:text-[var(--brand-taupe-muted)]"
        >
          <PencilIcon />
        </IconButton>
      ),
    },
  ];

  const groups = categories
    .map((category) => ({ category, rows: filtered.filter((i) => i.categoryId === category.id) }))
    .filter((g) => g.rows.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <Toolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={searchPlaceholder}
        filters={categoryOptions}
        filterValue={categoryFilter}
        onFilterChange={setCategoryFilter}
        action={
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="outline" onClick={onManageCategories} className="w-auto">
              Catégories
            </Button>
            <Button type="button" variant="dark" icon={<PlusIcon />} onClick={onAdd} className="w-auto">
              {addLabel}
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-2">
        <Switch checked={showInactive} onChange={setShowInactive} label="Afficher les inactifs" />
        <span className="text-sm font-medium text-[var(--color-gray-700)]">Afficher les inactifs</span>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--color-gray-200)] py-10 text-center text-sm text-[var(--color-gray-400)]">
          Aucun article ne correspond à cette recherche.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(({ category, rows }) => (
            <div key={category.id} className="flex flex-col gap-2">
              <FieldLabel>
                {category.name} · {rows.length}
              </FieldLabel>
              <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} onRowClick={onEdit} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

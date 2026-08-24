"use client";

import { useMemo, useState } from "react";
import { TagHeartIcon } from "@/components/ui/icons";
import { Pills, type PillOption } from "@/components/ui/pills";
import { LookbookCard } from "@/components/lookbook/lookbook-card";
import { LookbookEmpty } from "@/components/lookbook/lookbook-empty";
import { LOOKBOOK_CATEGORY_LABELS, LOOKBOOK_ITEMS, type LookbookCategory } from "@/lib/data/lookbook";

type CategoryFilter = "tous" | LookbookCategory;

const CATEGORY_ORDER: LookbookCategory[] = [
  "coiffure",
  "soins-cheveux",
  "ongles",
  "pedicure",
  "soin-visage",
  "epilation",
  "massage",
];

export default function LookbookPage() {
  const [filter, setFilter] = useState<CategoryFilter>("tous");

  const filterOptions: PillOption[] = useMemo(
    () => [
      { value: "tous", label: "Tous", count: LOOKBOOK_ITEMS.length },
      ...CATEGORY_ORDER.map((category) => ({
        value: category,
        label: LOOKBOOK_CATEGORY_LABELS[category],
        count: LOOKBOOK_ITEMS.filter((item) => item.category === category).length,
      })),
    ],
    [],
  );

  const items = useMemo(
    () => (filter === "tous" ? LOOKBOOK_ITEMS : LOOKBOOK_ITEMS.filter((item) => item.category === filter)),
    [filter],
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start gap-3">
        <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--core-brand-color)] text-[var(--on-core-brand-color)]">
          <TagHeartIcon className="size-5" />
        </span>
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl text-[var(--color-gray-900)]">Lookbook</h1>
          <p className="mt-1 text-sm text-[var(--color-gray-500)]">Styles et soins à proposer à vos clientes</p>
        </div>
      </div>

      <Pills options={filterOptions} value={filter} onChange={(value) => setFilter(value as CategoryFilter)} />

      {items.length === 0 ? (
        <LookbookEmpty />
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <LookbookCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

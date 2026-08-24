"use client";

import { useState } from "react";
import { Pills, type PillOption } from "@/components/ui/pills";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { ChevronIcon, TrashIcon } from "@/components/ui/icons";
import { PHOTO_CATEGORIES, PHOTO_REFERENCE_ITEMS, type PhotoCategoryKey } from "@/lib/data/parametres-general";

const TAB_OPTIONS: PillOption[] = PHOTO_CATEGORIES.map((category) => ({
  value: category.key,
  label: `${category.emoji} ${category.label}`,
}));

/**
 * Company selector + category tabs + upload grid for "Photos de référence". A single
 * component drives all 5 categories (couleurs ongles, formes ongles, types de cheveux,
 * marques cheveux, boissons) — only the option list and filled/empty state change.
 */
export function PhotoReferenceGrid() {
  const [category, setCategory] = useState<PhotoCategoryKey>("couleurs-ongles");
  const items = PHOTO_REFERENCE_ITEMS[category];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
          Entreprise concernée
        </p>
        <button
          type="button"
          className="flex w-full max-w-xs items-center justify-between rounded-xl border border-[var(--brand-taupe-muted)] bg-white px-4 py-3 text-left text-sm font-medium text-[var(--color-gray-900)]"
        >
          Beauty and Co
          <ChevronIcon className="rotate-90 text-[var(--brand-taupe-muted)]" />
        </button>
      </div>

      <Pills options={TAB_OPTIONS} value={category} onChange={(value) => setCategory(value as PhotoCategoryKey)} />

      <p className="text-sm text-[var(--color-gray-500)]">
        Uploadez des photos pour chaque option. Ces photos apparaîtront automatiquement dans les questions aux
        caissiers, facilitant leur compréhension visuelle.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((item) =>
          item.filled ? (
            <div
              key={item.label}
              className="flex flex-col overflow-hidden rounded-xl border border-[var(--color-gray-200)] bg-white"
            >
              <div className="aspect-[3/4] w-full" style={{ backgroundColor: item.swatch }} />
              <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <span className="truncate text-sm font-medium text-[var(--color-gray-800)]">{item.label}</span>
                <button
                  type="button"
                  aria-label={`Supprimer ${item.label}`}
                  className="shrink-0 text-[var(--color-error)] hover:opacity-70"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ) : (
            <div key={item.label} className="flex flex-col gap-2">
              <PhotoPlaceholder label="Ajouter" className="aspect-[3/4] w-full" />
              <p className="text-center text-sm text-[var(--color-gray-600)]">{item.label}</p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

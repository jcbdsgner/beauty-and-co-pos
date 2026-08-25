"use client";

import { useState } from "react";
import { Pills, type PillOption } from "@/components/ui/pills";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { ChevronIcon, TrashIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import {
  COMPANIES,
  PHOTO_CATEGORIES,
  PHOTO_REFERENCE_ITEMS,
  type PhotoCategoryKey,
} from "@/lib/data/parametres-general";

const TAB_OPTIONS: PillOption[] = PHOTO_CATEGORIES.map((category) => ({
  value: category.key,
  label: `${category.emoji} ${category.label}`,
}));

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-taupe-muted)] focus-visible:ring-offset-2";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Company selector + category tabs + upload grid for "Photos de référence". A single
 * component drives all 5 categories (couleurs ongles, formes ongles, types de cheveux,
 * marques cheveux, boissons) — only the option list and filled/empty state change.
 *
 * Uploading a real photo is out of scope for this build, so "Ajouter" and the trash icon
 * simulate the round-trip locally (mark the slot filled / empty again) rather than being dead
 * controls — the same items persist while switching tabs since state is keyed by category.
 */
export function PhotoReferenceGrid() {
  const [companyKey, setCompanyKey] = useState(COMPANIES[0].key);
  const [category, setCategory] = useState<PhotoCategoryKey>("couleurs-ongles");
  const [itemsByCategory, setItemsByCategory] = useState(PHOTO_REFERENCE_ITEMS);
  const items = itemsByCategory[category];

  function handleAdd(label: string) {
    setItemsByCategory((prev) => ({
      ...prev,
      [category]: prev[category].map((item) => (item.label === label ? { ...item, filled: true } : item)),
    }));
  }

  function handleRemove(label: string) {
    setItemsByCategory((prev) => ({
      ...prev,
      [category]: prev[category].map((item) =>
        item.label === label ? { ...item, filled: false, swatch: undefined } : item,
      ),
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase">
          Entreprise concernée
        </p>
        <div className="flex w-full max-w-xs items-center gap-2 rounded-xl border border-[var(--brand-taupe-muted)] bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-[var(--brand-taupe-muted)] focus-within:ring-offset-2">
          <select
            value={companyKey}
            onChange={(event) => setCompanyKey(event.target.value)}
            aria-label="Entreprise concernée"
            className="w-full cursor-pointer appearance-none bg-transparent text-left text-sm font-medium text-[var(--color-gray-900)] focus:outline-none"
          >
            {COMPANIES.map((company) => (
              <option key={company.key} value={company.key}>
                {company.name}
              </option>
            ))}
          </select>
          <ChevronIcon className="pointer-events-none shrink-0 rotate-90 text-[var(--brand-taupe-muted)]" />
        </div>
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
              {item.swatch ? (
                <div className="aspect-[3/4] w-full" style={{ backgroundColor: item.swatch }} />
              ) : (
                <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-1.5 bg-[var(--brand-rose-soft)] text-[var(--brand-taupe-muted)]">
                  <CheckIcon className="size-6" />
                  <span className="text-xs font-medium">Photo ajoutée</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <span className="truncate text-sm font-medium text-[var(--color-gray-800)]">{item.label}</span>
                <button
                  type="button"
                  aria-label={`Supprimer ${item.label}`}
                  onClick={() => handleRemove(item.label)}
                  className={cn("shrink-0 rounded text-[var(--color-error)] hover:opacity-70", focusRing)}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ) : (
            <button
              key={item.label}
              type="button"
              onClick={() => handleAdd(item.label)}
              aria-label={`Ajouter une photo — ${item.label}`}
              className={cn("flex flex-col gap-2 rounded-xl text-left", focusRing)}
            >
              <PhotoPlaceholder label="Ajouter" className="aspect-[3/4] w-full" />
              <p className="text-center text-sm text-[var(--color-gray-600)]">{item.label}</p>
            </button>
          ),
        )}
      </div>
    </div>
  );
}

"use client";

import { CategoryGlyph } from "@/components/vente/icons";
import type { Category } from "@/lib/data/vente";

type CategoryRailProps = {
  categories: Category[];
  activeId: string | null;
  onSelect: (categoryId: string | null) => void;
};

/** Persistent horizontal rail of category chips — replaces the old "grid landing page you leave,
 *  then a tiny back link to return" pattern. Switching category is one tap here, never a step. */
export function CategoryRail({ categories, activeId, onSelect }: CategoryRailProps) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`flex shrink-0 items-center gap-2 rounded-full py-2.5 pr-4 pl-2.5 text-sm font-semibold transition active:scale-[0.97] ${
          activeId === null
            ? "bg-[var(--core-brand-color)] text-black"
            : "border border-[var(--color-gray-200)] bg-white text-[var(--color-gray-600)] hover:border-[var(--brand-taupe-muted)]"
        }`}
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-white/70">✦</span>
        Tous
      </button>
      {categories.map((category) => {
        const active = category.id === activeId;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full py-2.5 pr-4 pl-2.5 text-sm font-semibold transition active:scale-[0.97] ${
              active
                ? "bg-[var(--pos-accent-dark)] text-white"
                : "border border-[var(--color-gray-200)] bg-white text-[var(--color-gray-600)] hover:border-[var(--brand-taupe-muted)]"
            }`}
          >
            <span className={`flex size-7 items-center justify-center rounded-full ${active ? "bg-white/20" : category.bg}`}>
              <CategoryGlyph icon={category.icon} className="size-4" />
            </span>
            {category.name}
            <span className={active ? "font-normal text-white/70" : "font-normal text-[var(--color-gray-400)]"}>{category.count}</span>
          </button>
        );
      })}
    </div>
  );
}

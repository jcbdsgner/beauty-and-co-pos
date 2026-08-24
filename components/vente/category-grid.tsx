"use client";

import { CategoryGlyph } from "@/components/vente/icons";
import type { Category } from "@/lib/data/vente";

type CategoryGridProps = {
  categories: Category[];
  onSelect: (categoryId: string) => void;
};

/** 3-column grid of service categories — each pastel card carries an icon, a name and its service count. */
export function CategoryGrid({ categories, onSelect }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className={`flex flex-col items-center gap-2 rounded-2xl ${category.bg} p-5 text-center transition hover:opacity-90`}
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-white/70 text-[var(--brand-taupe-muted)]">
            <CategoryGlyph icon={category.icon} />
          </span>
          <span className="text-[15px] font-semibold text-[var(--color-gray-900)]">{category.name}</span>
          <span className="text-xs text-[var(--color-gray-600)]">{category.count} services</span>
        </button>
      ))}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Scissors, Gem, Sparkles, Waves } from "lucide-react";
import { Toolbar } from "@/components/ui/organisms/toolbar";
import { Card } from "@/components/ui/atoms/card";
import { Badge } from "@/components/ui/atoms/badge";
import { EmptyState } from "@/components/ui/molecules/empty-state";
import { StyleDetailDialog } from "@/components/clientele/style-detail-dialog";
import { STYLES } from "@/lib/data/styles";
import { formatFcfa } from "@/lib/utils";
import type { Style, StyleCategory } from "@/lib/data/types";

const CATEGORY_LABEL: Record<StyleCategory, string> = {
  coiffure: "Coiffure",
  ongles: "Ongles",
  "soin-visage": "Soin visage",
  massage: "Massage",
};

const CATEGORY_ICON: Record<StyleCategory, typeof Scissors> = {
  coiffure: Scissors,
  ongles: Gem,
  "soin-visage": Sparkles,
  massage: Waves,
};

const FILTERS = [
  { value: "toutes", label: "Toutes" },
  ...(Object.keys(CATEGORY_LABEL) as StyleCategory[]).map((c) => ({ value: c, label: CATEGORY_LABEL[c] })),
];

/** Styles (bibliothèque Lookbook) — content grid, filterable by category. Détail style opens as a dialog, per USERFLOW.md. */
export function StylesTab() {
  const [filter, setFilter] = useState("toutes");
  const [selected, setSelected] = useState<Style | null>(null);

  const filtered = useMemo(() => (filter === "toutes" ? STYLES : STYLES.filter((s) => s.category === filter)), [filter]);

  return (
    <div className="flex flex-col gap-6">
      <Toolbar filters={FILTERS} filterValue={filter} onFilterChange={setFilter} />

      {filtered.length === 0 ? (
        <EmptyState icon={<Sparkles />} title="Aucun style dans cette catégorie" subtitle="Revenez plus tard ou choisissez une autre catégorie." />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((style) => {
            const Icon = CATEGORY_ICON[style.category];
            return (
              <Card
                key={style.id}
                onClick={() => setSelected(style)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelected(style);
                }}
                className="flex cursor-pointer flex-col overflow-hidden text-left transition active:scale-[0.97] hover:border-[var(--brand-taupe-muted)]"
              >
                <div className="relative flex aspect-square items-center justify-center bg-[var(--brand-rose-soft)]">
                  <Icon aria-hidden className="size-10 text-[var(--brand-taupe-muted)]" />
                  {style.trending && (
                    <Badge variant="dark" className="absolute top-2 left-2">
                      Tendance
                    </Badge>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-[var(--color-gray-900)]">{style.name}</p>
                  <p className="mt-0.5 text-sm font-semibold text-[var(--button-2-color)]">{formatFcfa(style.price)}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <StyleDetailDialog style={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

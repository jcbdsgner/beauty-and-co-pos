"use client";

import { useMemo, useState } from "react";
import { Board, Legend, BoardEmpty, ChipFilter } from "@/components/ui/board";
import { StyleDetailDialog } from "@/components/catalogue/style-detail-dialog";
import { STYLE_CATEGORY_LABEL, STYLE_ICON } from "@/components/catalogue/style-meta";
import { STYLES } from "@/lib/data/styles";
import { formatFcfa, cn } from "@/lib/utils";
import type { Style, StyleCategory } from "@/lib/data/types";

const FILTERS = [
  { value: "toutes", label: "Toutes" },
  ...(Object.keys(STYLE_CATEGORY_LABEL) as StyleCategory[]).map((c) => ({ value: c, label: STYLE_CATEGORY_LABEL[c] })),
];

/**
 * Les Planches — un index de planches numérotées (repère durable), ex-Lookbook. On feuillette
 * avec la cliente ; taper une planche ouvre son détail en lecture. Aucun lien vers le panier.
 */
export function CatalogueStyles() {
  const [filter, setFilter] = useState("toutes");
  const [selected, setSelected] = useState<Style | null>(null);

  const filtered = useMemo(
    () => (filter === "toutes" ? STYLES : STYLES.filter((s) => s.category === filter)),
    [filter],
  );

  return (
    <div className="flex flex-col gap-6">
      <Board
        legend={`${filtered.length} planche${filtered.length > 1 ? "s" : ""}`}
        legendRight={<ChipFilter options={FILTERS} value={filter} onChange={setFilter} wrap={false} className="max-w-full sm:max-w-[70%]" />}
        tone="plain"
      >
        {filtered.length === 0 ? (
          <BoardEmpty title="Rien dans cette catégorie" hint="Choisissez une autre catégorie ci-dessus." />
        ) : (
          <div className="grid grid-cols-3 gap-px bg-base-300 xl:grid-cols-4">
            {filtered.map((style, i) => {
              const Icon = STYLE_ICON[style.category];
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelected(style)}
                  className="group flex flex-col bg-white text-left transition active:bg-black/[0.03] hover:bg-black/[0.02]"
                >
                  <div className="relative flex aspect-[4/3] items-center justify-center bg-accent">
                    <span className="absolute left-2 top-2">
                      <Legend className="text-primary/60">Pl. {String(i + 1).padStart(2, "0")}</Legend>
                    </span>
                    <Icon aria-hidden className="size-9 text-primary" />
                    {style.trending && (
                      <span className="absolute bottom-2 right-2 rounded-[6px] bg-warning px-1.5 py-0.5 font-[family-name:var(--font-heading)] text-[0.55rem] font-bold uppercase tracking-[0.1em] text-white">
                        Tendance
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5 border-t border-base-300 p-3">
                    <p className="line-clamp-2 text-sm font-semibold text-base-content">{style.name}</p>
                    <p className={cn("mt-auto pt-1 text-sm font-semibold tabular-nums text-primary")}>
                      {formatFcfa(style.price)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Board>

      <StyleDetailDialog style={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

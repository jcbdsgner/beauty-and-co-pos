"use client";

import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Button } from "@/components/ui/atoms/button";
import { Legend } from "@/components/ui/board";
import { STYLE_ICON } from "@/components/catalogue/style-meta";
import { formatFcfa } from "@/lib/utils";
import type { Style } from "@/lib/data/types";

type StyleDetailDialogProps = {
  style: Style | null;
  onClose: () => void;
};

/** Détail planche — lecture seule, ouvert depuis Les Planches ou une recommandation en Fiche cliente. */
export function StyleDetailDialog({ style, onClose }: StyleDetailDialogProps) {
  if (!style) return null;
  const Icon = STYLE_ICON[style.category];

  return (
    <Dialog open labelledBy="planche-detail-title" className="relative w-full max-w-md overflow-hidden rounded-[14px] p-0">
      <CloseButton onClick={onClose} />

      <div className="relative flex aspect-[4/3] items-center justify-center bg-[var(--brand-rose-soft)]">
        <Icon aria-hidden className="size-16 text-[var(--brand-taupe-muted)]" />
        {style.trending && (
          <span className="absolute left-3 top-3 rounded-[6px] bg-[var(--board-amber)] px-2 py-1 font-[family-name:var(--font-heading)] text-[0.6rem] font-bold uppercase tracking-[0.1em] text-white">
            Tendance
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 p-6">
        <Legend>Planche</Legend>
        <h2 id="planche-detail-title" className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-gray-900)]">
          {style.name}
        </h2>
        <p className="text-2xl font-semibold tabular-nums text-[var(--button-2-color)]">{formatFcfa(style.price)}</p>
        <Button type="button" variant="outline" onClick={onClose} className="mt-2 w-full">
          Fermer
        </Button>
      </div>
    </Dialog>
  );
}

"use client";

import { Scissors, Gem, Sparkles, Waves, ShoppingBag } from "lucide-react";
import { Dialog } from "@/components/ui/molecules/dialog";
import { CloseButton } from "@/components/ui/atoms/icon-button";
import { Badge } from "@/components/ui/atoms/badge";
import { Button } from "@/components/ui/atoms/button";
import { formatFcfa } from "@/lib/utils";
import { useAppData } from "@/components/providers/app-data-provider";
import type { Style, StyleCategory } from "@/lib/data/types";

const CATEGORY_ICON: Record<StyleCategory, typeof Scissors> = {
  coiffure: Scissors,
  ongles: Gem,
  "soin-visage": Sparkles,
  massage: Waves,
};

type StyleDetailDialogProps = {
  style: Style | null;
  onClose: () => void;
  /** Called after the style is successfully added to the active open sale, so the caller can show its own confirmation. */
  onAdded?: () => void;
};

/** Détail style — opened from Styles, the Comptoir tray, or a Fiche cliente recommendation, per USERFLOW.md. */
export function StyleDetailDialog({ style, onClose, onAdded }: StyleDetailDialogProps) {
  const { sales, activeSaleId, addCartLine } = useAppData();

  if (!style) return null;
  const Icon = CATEGORY_ICON[style.category];
  const activeSale = sales.find((s) => s.id === activeSaleId);
  const canAddToCart = activeSale?.status === "ouverte";

  function handleAdd() {
    if (!activeSale || !style) return;
    addCartLine(activeSale.id, { refId: style.id, kind: "service", name: style.name, unitPrice: style.price });
    onAdded?.();
    onClose();
  }

  return (
    <Dialog open={style !== null} labelledBy="style-detail-title" className="relative w-full max-w-md rounded-3xl p-6">
      <CloseButton onClick={onClose} />

      <div className="relative flex aspect-[4/3] items-center justify-center rounded-2xl bg-[var(--brand-rose-soft)]">
        <Icon aria-hidden className="size-16 text-[var(--brand-taupe-muted)]" />
        {style.trending && (
          <Badge variant="dark" className="absolute top-3 left-3">
            Tendance
          </Badge>
        )}
      </div>

      <h2 id="style-detail-title" className="mt-4 font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
        {style.name}
      </h2>
      <p className="mt-1 text-2xl font-semibold text-[var(--button-2-color)]">{formatFcfa(style.price)}</p>

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Fermer
        </Button>
        {canAddToCart && (
          <Button type="button" variant="brand" icon={<ShoppingBag className="size-4" />} onClick={handleAdd} className="flex-1">
            Ajouter au panier
          </Button>
        )}
      </div>
    </Dialog>
  );
}

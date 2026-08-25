import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { CategoryVisual } from "@/components/lookbook/category-visual";
import { TrendIcon } from "@/components/lookbook/lookbook-card";
import { LOOKBOOK_CATEGORY_LABELS, formatLookbookPrice, type LookbookItem } from "@/lib/data/lookbook";

type LookbookDetailDialogProps = {
  item: LookbookItem | null;
  onClose: () => void;
};

/**
 * Fiche détail d'un style/soin — ouverte au clic sur une carte du Lookbook (le Figma source
 * note "Clic sur une carte doit ouvrir une fiche détail", sans capture dédiée). Reste une vue
 * locale au module : aucune action ne renvoie vers un autre écran/module.
 */
export function LookbookDetailDialog({ item, onClose }: LookbookDetailDialogProps) {
  return (
    <Dialog open={item !== null} labelledBy="lookbook-detail-title" className="max-w-sm rounded-3xl p-6 shadow-xl">
      {item && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--color-gray-500)] uppercase">
              {LOOKBOOK_CATEGORY_LABELS[item.category]}
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="flex size-8 items-center justify-center rounded-full border border-[var(--color-gray-200)] text-[var(--color-gray-500)] hover:bg-[var(--color-gray-50)]"
            >
              ×
            </button>
          </div>

          <div className="relative mt-3">
            <CategoryVisual category={item.category} className="rounded-2xl" iconClassName="size-14" />
            {item.trending && (
              <Badge variant="gold" icon={<TrendIcon />} className="absolute top-3 left-3">
                TENDANCE
              </Badge>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-1">
            <h2 id="lookbook-detail-title" className="font-[var(--font-heading)] text-xl text-[var(--color-gray-900)]">
              {item.title}
            </h2>
            <p className="text-base font-semibold text-[var(--pos-accent-dark)]">{formatLookbookPrice(item.price)}</p>
          </div>

          <Button variant="outline" className="mt-6 w-full" onClick={onClose}>
            Fermer
          </Button>
        </>
      )}
    </Dialog>
  );
}

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CategoryVisual } from "@/components/lookbook/category-visual";
import { LOOKBOOK_CATEGORY_LABELS, formatLookbookPrice, type LookbookItem } from "@/lib/data/lookbook";
import { cn } from "@/lib/utils";

export function TrendIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-3", className)}>
      <path
        d="M5 15l5.5-5.5L14 13l5.5-6M14 6.5h5.5V12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type LookbookCardProps = {
  item: LookbookItem;
  selected?: boolean;
  onSelect: (item: LookbookItem) => void;
};

/**
 * Carte produit du Lookbook : visuel de catégorie (aplat + icône), badge tendance, titre,
 * catégorie, prix. Cliquable au clavier comme à la souris — ouvre la fiche détail (voir
 * `LookbookDetailDialog`) ; un bouton transparent en overlay porte le focus/hover/clic pour
 * garder le balisage sémantique sans toucher au composant `Card` partagé.
 */
export function LookbookCard({ item, selected = false, onSelect }: LookbookCardProps) {
  return (
    <Card
      className={cn(
        "group relative flex flex-col overflow-hidden p-0 transition",
        selected ? "border-[var(--pos-accent-dark)]" : "hover:border-[var(--pos-accent-dark)]",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(item)}
        aria-label={`${item.title} — ${LOOKBOOK_CATEGORY_LABELS[item.category]}, ${formatLookbookPrice(item.price)}${item.trending ? ", tendance" : ""}`}
        className="absolute inset-0 z-10 rounded-2xl outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pos-accent-dark)]"
      />
      <div className="relative">
        <CategoryVisual category={item.category} />
        {item.trending && (
          <Badge variant="gold" icon={<TrendIcon />} className="absolute top-3 left-3">
            TENDANCE
          </Badge>
        )}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--color-gray-500)] uppercase">
          {LOOKBOOK_CATEGORY_LABELS[item.category]}
        </p>
        <p className="line-clamp-2 text-sm font-semibold text-[var(--color-gray-900)]">{item.title}</p>
        <p className="mt-1 text-sm text-[var(--color-gray-500)]">{formatLookbookPrice(item.price)}</p>
      </div>
    </Card>
  );
}

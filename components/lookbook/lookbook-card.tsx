import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CategoryVisual } from "@/components/lookbook/category-visual";
import { LOOKBOOK_CATEGORY_LABELS, formatLookbookPrice, type LookbookItem } from "@/lib/data/lookbook";

function TrendIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-3">
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
};

/** Carte produit du Lookbook : visuel de catégorie (aplat + icône), badge tendance, titre, catégorie, prix. */
export function LookbookCard({ item }: LookbookCardProps) {
  return (
    <Card className="group relative flex flex-col overflow-hidden p-0 transition hover:border-[var(--pos-accent-dark)]">
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

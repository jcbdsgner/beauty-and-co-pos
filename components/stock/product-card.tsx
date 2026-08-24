import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Product } from "@/lib/data/stock";
import { cn } from "@/lib/utils";
import { BagIcon } from "@/components/ui/icons";
import { DropIcon, HourglassIcon, PaperPlaneIcon } from "@/components/stock/icons";
import { stockLevel, StockProgressBar } from "@/components/stock/stock-progress-bar";

const LEVEL_BORDER: Record<ReturnType<typeof stockLevel>, string> = {
  rupture: "border-l-[var(--color-error)]",
  bas: "border-l-[var(--color-warning)]",
  ok: "border-l-[var(--color-success)]",
};

const LEVEL_BADGE_BG: Record<ReturnType<typeof stockLevel>, string> = {
  rupture: "bg-[var(--color-error)] text-white",
  bas: "bg-[#fdece9] text-[var(--color-error)]",
  ok: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
};

function TypeBadge({ type }: { type: Product["type"] }) {
  return type === "revente" ? (
    <Badge variant="success">REVENTE</Badge>
  ) : (
    <Badge variant="vip" icon={<DropIcon className="size-3.5" />}>
      BACKBAR
    </Badge>
  );
}

type OverviewCardProps = {
  variant: "overview";
  product: Product;
  locationLabel: string;
  onReappro?: (product: Product) => void;
};

type DepotCardProps = {
  variant: "depot";
  product: Product;
  onReappro?: (product: Product) => void;
};

type SalonCardProps = {
  variant: "salon";
  product: Product;
  onReappro?: (product: Product) => void;
};

type ProductCardProps = OverviewCardProps | DepotCardProps | SalonCardProps;

/** Single product row/card — the recurring pattern reused across Vue d'ensemble, Depot and Salon (stock gauge + qty + action differ per context). */
export function ProductCard(props: ProductCardProps) {
  const { product } = props;
  const level = stockLevel(
    props.variant === "salon" ? (product.salonStock ?? 0) : product.depotStock,
    product.min,
  );

  if (props.variant === "overview") {
    return (
      <Card className={cn("flex items-start gap-4 border-l-4 p-4", LEVEL_BORDER[level])}>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-gray-100)] text-[var(--color-gray-600)]">
          {product.type === "backbar" ? <DropIcon /> : <BagIcon className="size-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[var(--color-gray-900)]">{product.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--color-gray-500)]">
            <span>{props.locationLabel}</span>
            <TypeBadge type={product.type} />
          </div>
          <StockProgressBar stock={product.depotStock} min={product.min} className="mt-3" />
          <div className="mt-2 flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-[var(--color-gray-400)]">
              <HourglassIcon />—
            </span>
            {product.toOrder > 0 && (
              <span className="text-xs font-semibold text-[var(--pos-accent-dark)]">Commander ~{product.toOrder}</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-full text-sm font-bold",
              LEVEL_BADGE_BG[level],
            )}
          >
            {product.depotStock}
          </span>
          <Button variant="brand" icon={<span className="text-xs">+</span>} className="px-3 py-1.5 text-xs" onClick={() => props.onReappro?.(product)}>
            Reappro
          </Button>
        </div>
      </Card>
    );
  }

  if (props.variant === "depot") {
    const isRupture = level === "rupture";
    return (
      <Card className={cn("border-l-4 p-4", LEVEL_BORDER[level])}>
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              level === "ok" ? "bg-[var(--color-success-soft)] text-[var(--color-success)]" : "bg-[var(--color-gray-100)] text-[var(--color-gray-600)]",
            )}
          >
            {product.type === "backbar" ? <DropIcon /> : <BagIcon className="size-4" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-[var(--color-gray-900)]">{product.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--color-gray-500)]">
              <TypeBadge type={product.type} />
              <span className="text-[var(--color-gray-400)]">{product.ref}</span>
            </div>
            {level !== "ok" && (
              <Badge variant="error" className="mt-2">
                {isRupture ? "RUPTURE" : `STOCK BAS (MIN: ${product.min})`}
              </Badge>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span
              className={cn(
                "font-[var(--font-heading)] text-2xl",
                level === "ok" ? "text-[var(--color-success)]" : "text-[var(--color-warning)]",
              )}
            >
              {product.depotStock}
            </span>
            <Button variant="brand" className="px-3 py-1.5 text-xs" onClick={() => props.onReappro?.(product)}>
              + Reappro
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // variant === "salon"
  return (
    <Card className={cn("border-l-4 p-4", LEVEL_BORDER[level])}>
      <div className="flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-gray-100)] text-[var(--color-gray-600)]">
          {product.type === "backbar" ? <DropIcon /> : <BagIcon className="size-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[var(--color-gray-900)]">{product.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--color-gray-500)]">
            <TypeBadge type={product.type} />
          </div>
          <p className="mt-2 text-xs text-[var(--color-gray-500)]">En stock : {product.salonStock ?? 0}</p>
          <p className="text-xs text-[var(--color-gray-400)]">Stock depot : {product.depotStock}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className={cn(
              "font-[var(--font-heading)] text-2xl",
              level === "ok" ? "text-[var(--color-success)]" : "text-[var(--color-warning)]",
            )}
          >
            {product.salonStock ?? 0}
          </span>
          <Button variant="outline" icon={<PaperPlaneIcon />} className="px-3 py-1.5 text-xs" onClick={() => props.onReappro?.(product)}>
            Reappro
          </Button>
        </div>
      </div>
    </Card>
  );
}

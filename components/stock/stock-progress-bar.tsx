import { cn } from "@/lib/utils";

type StockLevel = "rupture" | "bas" | "ok";

/** Derives the semantic stock level from a quantity vs. its reorder threshold. */
export function stockLevel(stock: number, min: number): StockLevel {
  if (stock <= 0) return "rupture";
  if (stock < min) return "bas";
  return "ok";
}

const LEVEL_COLOR: Record<StockLevel, string> = {
  rupture: "var(--color-error)",
  bas: "var(--color-warning)",
  ok: "var(--color-success)",
};

const LEVEL_CAPTION: Record<StockLevel, string> = {
  rupture: "Rupture de stock",
  bas: "Sous le seuil",
  ok: "Stock suffisant",
};

type StockProgressBarProps = {
  stock: number;
  min: number;
  className?: string;
};

/**
 * Thin horizontal gauge — near-empty and red when out of stock, the recurring urgency cue
 * across the module. Status is never carried by color alone: a caption states the quantity and
 * level in text, and the bar exposes the same reading to assistive tech via aria-label.
 */
export function StockProgressBar({ stock, min, className }: StockProgressBarProps) {
  const level = stockLevel(stock, min);
  const capacity = Math.max(min * 3, 10);
  const percent = stock <= 0 ? 3 : Math.max(4, Math.min(100, Math.round((stock / capacity) * 100)));

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div
        role="img"
        aria-label={`${stock} en stock, seuil ${min} — ${LEVEL_CAPTION[level]}`}
        className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-gray-100)]"
      >
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${percent}%`, backgroundColor: LEVEL_COLOR[level] }}
        />
      </div>
      <p className="text-[11px] font-medium" style={{ color: LEVEL_COLOR[level] }}>
        {stock} en stock · seuil {min}
      </p>
    </div>
  );
}

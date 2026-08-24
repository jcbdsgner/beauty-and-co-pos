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

type StockProgressBarProps = {
  stock: number;
  min: number;
  className?: string;
};

/** Thin horizontal gauge — near-empty and red when out of stock, the recurring urgency cue across the module. */
export function StockProgressBar({ stock, min, className }: StockProgressBarProps) {
  const level = stockLevel(stock, min);
  const capacity = Math.max(min * 3, 10);
  const percent = stock <= 0 ? 3 : Math.max(4, Math.min(100, Math.round((stock / capacity) * 100)));

  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-gray-100)]", className)}>
      <div
        className="h-full rounded-full transition-[width]"
        style={{ width: `${percent}%`, backgroundColor: LEVEL_COLOR[level] }}
      />
    </div>
  );
}

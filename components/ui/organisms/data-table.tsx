import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  /** Column's share of the row width relative to the others (default 1) — a name column usually
   *  wants more room than a price column. */
  weight?: number;
  render: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
};

const ALIGN_CLASS = { left: "text-left", right: "text-right", center: "text-center" };

/**
 * Rebuilt off `<table>` entirely — a real HTML table is a mouse-and-precision-pointer object
 * (small cells meant for fine visual scanning across dense columns), and PRODUCT.md is explicit
 * that this app is a touch counter tool, not a data-dense dashboard. Each row is now a CSS-grid
 * flex row with real height (min-h-14) and full-row press feedback, laid out with the same
 * column definitions so a name column can still claim more width than a price column — a
 * catalogue/report list you tap, not a spreadsheet you point at.
 */
export function DataTable<T>({ columns, rows, rowKey, onRowClick, emptyMessage = "Aucun résultat.", className }: DataTableProps<T>) {
  const template = columns.map((c) => `${c.weight ?? 1}fr`).join(" ");

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-[var(--color-gray-200)] bg-white", className)}>
      <div
        className="grid gap-2 border-b border-[var(--color-gray-200)] px-4 py-3"
        style={{ gridTemplateColumns: template }}
      >
        {columns.map((col) => (
          <span
            key={col.key}
            className={cn("text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase", ALIGN_CLASS[col.align ?? "left"])}
          >
            {col.header}
          </span>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-[var(--color-gray-400)]">{emptyMessage}</p>
      ) : (
        rows.map((row) => (
          <div
            key={rowKey(row)}
            role={onRowClick ? "button" : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            onKeyDown={onRowClick ? (e) => (e.key === "Enter" || e.key === " ") && onRowClick(row) : undefined}
            className={cn(
              "grid min-h-14 items-center gap-2 border-b border-[var(--color-gray-100)] px-4 py-3 text-[15px] text-[var(--color-gray-800)] transition last:border-b-0",
              onRowClick && "cursor-pointer active:bg-[var(--brand-rose-soft)]/70 hover:bg-[var(--brand-rose-soft)]/40",
            )}
            style={{ gridTemplateColumns: template }}
          >
            {columns.map((col) => (
              <div key={col.key} className={cn("min-w-0", ALIGN_CLASS[col.align ?? "left"])}>
                {col.render(row)}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
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

/** Flat-bordered data grid (product/report lists) — plain rows, no zebra striping (a gradient-adjacent effect DESIGN.md doesn't sanction); the hairline row border carries the rhythm instead. */
export function DataTable<T>({ columns, rows, rowKey, onRowClick, emptyMessage = "Aucun résultat.", className }: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-[var(--color-gray-200)] bg-white", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--color-gray-200)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-xs font-semibold tracking-wide text-[var(--color-gray-500)] uppercase",
                  ALIGN_CLASS[col.align ?? "left"],
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-[var(--color-gray-400)]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-[var(--color-gray-100)] last:border-b-0",
                  // A full-width row can't scale like a tile without looking broken across
                  // columns — active:bg is this row's version of the app's tap-press feedback.
                  onRowClick && "cursor-pointer transition hover:bg-[var(--brand-rose-soft)]/40 active:bg-[var(--brand-rose-soft)]/70",
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3 text-[var(--color-gray-800)]", ALIGN_CLASS[col.align ?? "left"])}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

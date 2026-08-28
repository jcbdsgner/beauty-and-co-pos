"use client";

import { useMemo } from "react";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
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
const features = tableFeatures({});

/**
 * Structured on TanStack Table v9 (headless core row model) so a configuration list can grow
 * sorting/pagination later without a rewrite — but rendered as CSS-grid rows, not a `<table>`:
 * a real HTML table is a mouse-and-precision-pointer object (tiny cells for dense visual
 * scanning), and PRODUCT.md is explicit that this is a touch counter tool. Rows keep real height
 * (min-h-16), full-row press feedback, and the caller's column weights.
 */
export function DataTable<T extends Record<string, unknown>>({ columns, rows, rowKey, onRowClick, emptyMessage = "Aucun résultat.", className }: DataTableProps<T>) {
  const template = columns.map((c) => `${c.weight ?? 1}fr`).join(" ");

  const tableColumns = useMemo(() => {
    const helper = createColumnHelper<typeof features, T>();
    return helper.columns(
      columns.map((col) =>
        helper.display({
          id: col.key,
          header: col.header,
          cell: ({ row }) => col.render(row.original),
        }),
      ),
    );
  }, [columns]);

  const table = useTable({
    features,
    columns: tableColumns,
    data: rows,
    getRowId: (row) => rowKey(row),
  });

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-white", className)}>
      <div
        className="grid gap-2 border-b border-border px-4 py-3"
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
        <p className="px-4 py-12 text-center text-sm text-[var(--color-gray-400)]">{emptyMessage}</p>
      ) : (
        table.getRowModel().rows.map((row) => (
          <div
            key={row.id}
            role={onRowClick ? "button" : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onClick={onRowClick ? () => onRowClick(row.original) : undefined}
            onKeyDown={onRowClick ? (e) => (e.key === "Enter" || e.key === " ") && onRowClick(row.original) : undefined}
            className={cn(
              "grid min-h-16 items-center gap-2 border-b border-[var(--color-gray-100)] px-4 py-3 text-[15px] text-[var(--color-gray-800)] transition last:border-b-0",
              onRowClick && "cursor-pointer outline-none hover:bg-accent/40 active:bg-accent/70 focus-visible:bg-accent/40",
            )}
            style={{ gridTemplateColumns: template }}
          >
            {row.getAllCells().map((cell, i) => (
              <div key={cell.id} className={cn("min-w-0", ALIGN_CLASS[columns[i]?.align ?? "left"])}>
                <table.FlexRender cell={cell} />
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

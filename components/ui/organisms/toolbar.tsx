import { SearchInput } from "@/components/ui/atoms/search-input";
import { Pills, type PillOption } from "@/components/ui/molecules/pills";
import { cn } from "@/lib/utils";

type ToolbarProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: PillOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  action?: React.ReactNode;
  className?: string;
};

/**
 * List-page header row: search + filter pills + a trailing primary action — the recurring shape
 * above every catalogue/list screen (produits, clients, historique). Any slot is optional so a
 * page can drop just the pieces it needs.
 */
export function Toolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Rechercher…",
  filters,
  filterValue,
  onFilterChange,
  action,
  className,
}: ToolbarProps) {
  const hasSearch = onSearchChange !== undefined;
  const hasFilters = filters && filters.length > 0 && onFilterChange;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {(hasSearch || action) && (
        <div className="flex items-center gap-3">
          {hasSearch && (
            <SearchInput
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1"
            />
          )}
          {action}
        </div>
      )}
      {hasFilters && (
        <div className="overflow-x-auto">
          <Pills options={filters} value={filterValue ?? ""} onChange={onFilterChange!} className="flex-nowrap" />
        </div>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";

export type PillOption = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
};

type PillsProps = {
  options: PillOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

/**
 * Horizontal row of selectable pills — the recurring exclusive-choice pattern (toggles à 2
 * segments type Services/Produits, filtres par rôle/catégorie/statut, onglets de sous-page).
 * Active pill = flat brand fill (rose), inactive = thin neutral border.
 */
export function Pills({ options, value, onChange, className }: PillsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-[var(--core-brand-color)] text-black"
                : "border border-[var(--color-gray-200)] bg-white text-[var(--color-gray-600)] hover:bg-[var(--color-gray-50)]",
            )}
          >
            {option.icon}
            {option.label}
            {typeof option.count === "number" && (
              <span className={cn("text-xs", active ? "text-black/60" : "text-[var(--color-gray-400)]")}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

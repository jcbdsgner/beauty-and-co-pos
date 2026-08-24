import { ChevronIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type Option = { id: string; label: string };

type EntitySelectProps = {
  icon: React.ReactNode;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
};

/** Full-width select with a leading icon — the "entreprise"/"salon" scope pickers atop Gestion Depot. */
export function EntitySelect({ icon, value, options, onChange, className }: EntitySelectProps) {
  return (
    <div
      className={cn(
        "relative flex flex-1 items-center gap-2 rounded-xl border border-[var(--color-gray-200)] bg-white px-4 py-3 text-[var(--color-gray-600)] focus-within:border-[var(--brand-taupe-muted)]",
        className,
      )}
    >
      <span className="shrink-0 text-[var(--pos-accent-dark)]">{icon}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none bg-transparent text-[15px] font-medium text-[var(--color-gray-900)] focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronIcon className="pointer-events-none shrink-0 rotate-90 text-[var(--color-gray-400)]" />
    </div>
  );
}

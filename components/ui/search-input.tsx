import { cn } from "@/lib/utils";

type SearchInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  className?: string;
};

function SearchIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="size-4 shrink-0">
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18 18l-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Full-width search field with a leading icon, used for every list/catalogue search bar in the app. */
export function SearchInput({ className, ...rest }: SearchInputProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-[var(--color-gray-200)] bg-white px-4 py-3 text-[var(--color-gray-400)] focus-within:border-[var(--brand-taupe-muted)]",
        className,
      )}
    >
      <SearchIcon />
      <input
        type="search"
        className="w-full bg-transparent text-[15px] text-[var(--color-gray-900)] placeholder:text-[var(--color-gray-400)] focus:outline-none"
        {...rest}
      />
    </div>
  );
}

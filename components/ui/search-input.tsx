import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  className?: string;
};

/** Full-width search field with a leading icon, used for every list/catalogue search bar in the app. */
export function SearchInput({ className, ...rest }: SearchInputProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-[var(--color-gray-200)] bg-white px-4 py-3 text-[var(--color-gray-400)] focus-within:border-[var(--brand-taupe-muted)]",
        className,
      )}
    >
      <Search aria-hidden className="size-4 shrink-0" />
      <input
        type="search"
        className="w-full bg-transparent text-[15px] text-[var(--color-gray-900)] placeholder:text-[var(--color-gray-400)] focus:outline-none"
        {...rest}
      />
    </div>
  );
}

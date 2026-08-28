import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  className?: string;
};

/**
 * Rounded-full, not the rounded-xl of a form TextInput — search is a different kind of field
 * (filtering a list you're already looking at, not filling out a record), and its own silhouette
 * means a search bar never reads as "a required field I haven't finished." 56px tall.
 */
export function SearchInput({ className, ...rest }: SearchInputProps) {
  return (
    <div
      className={cn(
        "flex h-14 items-center gap-2 rounded-full border border-border bg-white px-4 text-[var(--color-gray-400)] transition",
        "focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/15",
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

import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

/** Base white rounded surface — the building block for every list item, form section and stat tile in the app. */
export function Card({ className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--color-gray-200)] bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)]",
        className,
      )}
      {...rest}
    />
  );
}

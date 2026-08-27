import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/** Loading placeholder block — a pulsing flat fill, same rounding language as Card (rounded-2xl by default). */
export function Skeleton({ className, ...rest }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-2xl bg-[var(--color-gray-100)]", className)} {...rest} />;
}

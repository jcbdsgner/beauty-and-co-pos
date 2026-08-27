import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * The resting, flat surface — no shadow. DESIGN.md's own Flat-Fill Rule says depth comes from
 * color fields and borders, not layered shadows, yet the old Card carried a permanent ambient
 * shadow identical in weight to Dialog's. Now a hairline border is the *only* signal a Card sits
 * on the page; Dialog's real elevation (see dialog.tsx) is what "lifted" actually looks like —
 * the two no longer read as the same box at two shadow opacities.
 */
export function Card({ className, ...rest }: CardProps) {
  return <div className={cn("rounded-2xl border border-[var(--color-gray-200)] bg-white", className)} {...rest} />;
}

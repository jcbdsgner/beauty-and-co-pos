import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = { label: string; href?: string };

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

/** "Suivi › Campagnes" style trail — for a sub-page nested more than one level under a section. */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d'ariane" className={cn("flex items-center gap-1.5 text-sm", className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link href={item.href} className="text-[var(--color-gray-500)] hover:text-[var(--brand-taupe-muted)]">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-semibold text-[var(--color-gray-900)]" : "text-[var(--color-gray-500)]"}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight aria-hidden className="size-3.5 text-[var(--color-gray-300)]" />}
          </span>
        );
      })}
    </nav>
  );
}

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { BrandMark } from "@/components/ui/atoms/brand-mark";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  /** Small kicker above the title (e.g. a date, a count). The diamond glyph sits before it. */
  eyebrow?: string;
  backHref?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
  className?: string;
};

/**
 * The back-office masthead — an editorial band, not a compact toolbar. Title in Cabinet Grotesk bold at display
 * scale, an optional kicker carried by the diamond glyph, the section's primary action on the
 * right. Used at the top of every section and sub-page.
 */
export function PageHeader({ title, subtitle, eyebrow, backHref, align = "left", action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 border-b border-border pb-5", className)}>
      <div className={cn("flex min-w-0 items-start gap-4", align === "center" && "w-full justify-center text-center")}>
        {backHref && (
          <Link
            href={backHref}
            aria-label="Retour"
            className="mt-1 flex h-12 shrink-0 items-center gap-1.5 rounded-full border border-border bg-white px-4 text-[15px] font-medium text-[var(--color-gray-600)] transition active:scale-[0.97] hover:bg-[var(--color-gray-50)] outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
          >
            <ChevronLeft aria-hidden className="size-4" />
            Retour
          </Link>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-secondary uppercase">
              <BrandMark className="size-3" />
              {eyebrow}
            </p>
          )}
          <h1 className="font-[family-name:var(--font-heading)] font-bold text-[2.25rem] leading-[1.1] text-[var(--color-gray-900)]">{title}</h1>
          {subtitle && <p className="mt-2 text-[15px] text-[var(--color-gray-500)]">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0 pt-1">{action}</div>}
    </div>
  );
}

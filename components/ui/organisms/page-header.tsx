import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
  className?: string;
};

/** Back arrow + serif title (+ optional subtitle / right-aligned action) — the header pattern reused at the top of every sub-page. */
export function PageHeader({ title, subtitle, backHref, align = "left", action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className={cn("flex items-start gap-3", align === "center" && "w-full justify-center text-center")}>
        {backHref && (
          // DESIGN.md is explicit: back navigation is "a real button (icon + label, bordered,
          // ≥44px tall) — never a bare text link with an inline chevron." A bare size-8 (32px)
          // circular chevron was exactly that anti-pattern.
          <Link
            href={backHref}
            aria-label="Retour"
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-gray-200)] bg-white px-4 text-sm font-medium text-[var(--color-gray-600)] transition active:scale-[0.97] hover:bg-[var(--color-gray-50)]"
          >
            <ChevronLeft aria-hidden className="size-4" />
            Retour
          </Link>
        )}
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl text-[var(--color-gray-900)]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-[var(--color-gray-500)]">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

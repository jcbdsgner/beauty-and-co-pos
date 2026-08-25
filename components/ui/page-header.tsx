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
          <Link
            href={backHref}
            aria-label="Retour"
            className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--color-gray-500)] hover:bg-[var(--color-gray-100)]"
          >
            <ChevronLeft aria-hidden className="size-5" />
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

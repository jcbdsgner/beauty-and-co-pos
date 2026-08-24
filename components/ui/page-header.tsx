import Link from "next/link";
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
            <svg aria-hidden viewBox="0 0 20 20" fill="none" className="size-5">
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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

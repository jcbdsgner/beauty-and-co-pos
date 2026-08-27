import { Card } from "@/components/ui/atoms/card";
import { cn } from "@/lib/utils";

type ComptoirPanelProps = {
  icon?: React.ReactNode;
  title: string;
  /** Scrollable body — cart lines, a client's rendez-vous list, whatever the counter task needs. */
  children: React.ReactNode;
  /** Pinned below the scrollable body — a running total + primary CTA, kept reachable no matter how long the body gets. */
  footer?: React.ReactNode;
  className?: string;
};

/**
 * Docked side-panel shell for a counter task (checkout cart, client quick-view, appointment
 * detail) — generalizes the earlier one-off "cart panel" shape into a reusable organism. Sticky
 * within its own scroll container, header and footer pinned, only the body scrolls.
 */
export function ComptoirPanel({ icon, title, children, footer, className }: ComptoirPanelProps) {
  return (
    <Card className={cn("sticky top-6 flex max-h-[calc(100vh-3rem)] flex-col overflow-hidden", className)}>
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--color-gray-200)] p-5">
        {icon && <span className="text-[var(--brand-taupe-muted)]">{icon}</span>}
        <h2 className="font-[var(--font-heading)] text-lg text-[var(--color-gray-900)]">{title}</h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>

      {footer && <div className="shrink-0 border-t border-[var(--color-gray-200)] p-5">{footer}</div>}
    </Card>
  );
}

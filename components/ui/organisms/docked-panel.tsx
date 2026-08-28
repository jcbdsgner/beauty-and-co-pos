import { Card } from "@/components/ui/atoms/card";
import { cn } from "@/lib/utils";

type DockedPanelProps = {
  icon?: React.ReactNode;
  title: string;
  /** Scrollable body — a client's rendez-vous list, a filter panel, whatever the counter task needs. */
  children: React.ReactNode;
  /** Pinned below the scrollable body — a running total + primary CTA, kept reachable no matter how long the body gets. */
  footer?: React.ReactNode;
  className?: string;
};

/**
 * Docked side-panel shell, sticky within its own scroll container — for a secondary panel that
 * sits *beside* page content (not the Comptoir itself: that's a full-viewport mode change, see
 * `components/comptoir/comptoir-panel.tsx`, not this generic primitive).
 */
export function DockedPanel({ icon, title, children, footer, className }: DockedPanelProps) {
  return (
    <Card className={cn("sticky top-6 flex max-h-[calc(100vh-3rem)] flex-col overflow-hidden", className)}>
      <div className="flex shrink-0 items-center gap-2 border-b border-border p-5">
        {icon && <span className="text-secondary">{icon}</span>}
        <h2 className="font-[family-name:var(--font-heading)] font-bold text-lg text-[var(--color-gray-900)]">{title}</h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>

      {footer && <div className="shrink-0 border-t border-border p-5">{footer}</div>}
    </Card>
  );
}

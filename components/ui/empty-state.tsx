import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
};

/** Centered icon + message + optional submessage — used for every "no data yet" screen (planning vide, historique vide, notes vides…). */
export function EmptyState({ icon, title, subtitle, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-6 py-16 text-center", className)}>
      <div className="mb-2 text-[var(--color-gray-300)] [&_svg]:size-12">{icon}</div>
      <p className="font-medium text-[var(--color-gray-700)]">{title}</p>
      {subtitle && <p className="text-sm text-[var(--color-gray-500)]">{subtitle}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

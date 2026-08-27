import { Avatar } from "@/components/ui/atoms/avatar";
import { Badge, type BadgeVariant } from "@/components/ui/atoms/badge";
import { cn } from "@/lib/utils";

type PersonCardProps = {
  initial: string;
  name: string;
  meta?: string;
  badge?: { label: string; variant: BadgeVariant };
  trailing?: string;
  online?: boolean;
  onClick?: () => void;
  className?: string;
};

/** Avatar + name + meta + optional tier badge — the "carte personne" pattern reused identically for team members and clients. */
export function PersonCard({ initial, name, meta, badge, trailing, online, onClick, className }: PersonCardProps) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border border-[var(--color-gray-200)] bg-white p-4 text-left transition",
        onClick && "active:scale-[0.97] hover:border-[var(--brand-taupe-muted)]",
        className,
      )}
    >
      <span className="relative shrink-0">
        <Avatar initial={initial} size={44} className="bg-[var(--brand-rose-soft)] font-semibold text-[var(--brand-taupe-muted)]" />
        {online && (
          <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white bg-[var(--color-success)]" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-semibold text-[var(--color-gray-900)]">{name}</span>
          {badge && (
            <Badge variant={badge.variant} className="shrink-0">
              {badge.label}
            </Badge>
          )}
        </span>
        {meta && <span className="block truncate text-sm text-[var(--color-gray-500)]">{meta}</span>}
      </span>
      {trailing && <span className="shrink-0 text-xs text-[var(--color-gray-400)]">{trailing}</span>}
    </Comp>
  );
}
